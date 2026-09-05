// Self-contained toy data + a bagging ensemble for the Ch.45 bagging-intuition
// explorer. The ensemble wraps the site's existing CART implementation
// (src/lib/decisionTree.ts): each base tree is fit on its own random subset of
// the rows (with or without replacement) and, optionally, its own random
// subset of the columns. That single set of knobs covers all four bagging
// variants the video names:
//
//   bagging          rows with replacement,    all columns
//   pasting          rows without replacement, all columns
//   random subspaces all rows,                 subset of columns
//   random patches   subset of rows,           subset of columns

import { DecisionTree, type TreeParams } from './decisionTree';

export type Point = [number, number];

export interface Bounds {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export interface Dataset {
  Xtr: Point[];
  ytr: number[];
  Xte: Point[];
  yte: number[];
  bounds: Bounds;
}

export type DatasetName = 'two-moons' | 'concentric' | 'xor' | 'u-shaped';

const BOUNDS: Bounds = { xmin: -3, xmax: 3, ymin: -3, ymax: 3 };

// --- deterministic RNG ------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Deliberately noisy so a single fully-grown tree visibly overfits and the
// variance reduction from bagging is easy to see.
export function makeDataset(name: DatasetName, seed = 7): Dataset {
  const rand = mulberry32(seed);
  const X: Point[] = [];
  const y: number[] = [];
  const nPer = 130;

  if (name === 'two-moons') {
    for (let i = 0; i < nPer; i++) {
      const t = (i / nPer) * Math.PI;
      X.push([2 * Math.cos(t) - 1 + gauss(rand) * 0.5, 2 * Math.sin(t) - 0.4 + gauss(rand) * 0.5]);
      y.push(0);
      X.push([2 * Math.cos(t) + 1 + gauss(rand) * 0.5, -2 * Math.sin(t) + 0.4 + gauss(rand) * 0.5]);
      y.push(1);
    }
  } else if (name === 'concentric') {
    for (let i = 0; i < nPer; i++) {
      const a = rand() * 2 * Math.PI;
      X.push([1.0 * Math.cos(a) + gauss(rand) * 0.45, 1.0 * Math.sin(a) + gauss(rand) * 0.45]);
      y.push(0);
      const a2 = rand() * 2 * Math.PI;
      X.push([2.3 * Math.cos(a2) + gauss(rand) * 0.45, 2.3 * Math.sin(a2) + gauss(rand) * 0.45]);
      y.push(1);
    }
  } else if (name === 'xor') {
    for (let i = 0; i < nPer * 2; i++) {
      const x0 = -2.6 + rand() * 5.2;
      const x1 = -2.6 + rand() * 5.2;
      let cls = x0 * x1 > 0 ? 1 : 0;
      if (rand() < 0.12) cls = 1 - cls; // label noise
      X.push([x0, x1]);
      y.push(cls);
    }
  } else {
    // u-shaped
    for (let i = 0; i < nPer; i++) {
      const t = -2 + (4 * i) / nPer;
      X.push([t + gauss(rand) * 0.35, 0.55 * t * t - 1 + gauss(rand) * 0.4]);
      y.push(0);
      X.push([t + gauss(rand) * 0.35, 0.55 * t * t + 0.7 + gauss(rand) * 0.4]);
      y.push(1);
    }
  }

  // shuffle, then 65 / 35 train / test split
  const idx = X.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const cut = Math.floor(idx.length * 0.65);
  const pick = (ids: number[]) => ({ X: ids.map((i) => X[i]), y: ids.map((i) => y[i]) });
  const tr = pick(idx.slice(0, cut));
  const te = pick(idx.slice(cut));
  return { Xtr: tr.X, ytr: tr.y, Xte: te.X, yte: te.y, bounds: BOUNDS };
}

// --- bagging ensemble ----------------------------------------------------
export interface BaggingConfig {
  nEstimators: number;
  maxSamples: number; // fraction of training rows per base tree
  bootstrapRows: boolean; // true => with replacement (bagging), false => pasting
  singleFeature: boolean; // true => each tree sees 1 random column (random subspaces)
  maxDepth: number; // 0 => unlimited (fully grown)
  seed: number;
}

interface BaseTree {
  tree: DecisionTree;
  features: number[]; // which of [0,1] this tree was trained on
}

const TREE_PARAMS = (maxDepth: number, randomState: number): TreeParams => ({
  task: 'classification',
  criterion: 'gini',
  splitter: 'best',
  maxDepth,
  minSamplesSplit: 2,
  minSamplesLeaf: 1,
  maxLeafNodes: 0,
  minImpurityDecrease: 0,
  randomState,
});

export class BaggingEnsemble {
  bases: BaseTree[] = [];

  constructor(Xtr: Point[], ytr: number[], cfg: BaggingConfig) {
    const rand = mulberry32(cfg.seed);
    const n = Xtr.length;
    const k = Math.max(2, Math.round(n * cfg.maxSamples));

    for (let e = 0; e < cfg.nEstimators; e++) {
      // --- row subset ---
      let rows: number[];
      if (cfg.bootstrapRows) {
        rows = Array.from({ length: k }, () => Math.floor(rand() * n));
      } else {
        const pool = Xtr.map((_, i) => i);
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        rows = pool.slice(0, Math.min(k, n));
      }

      // --- column subset ---
      const features = cfg.singleFeature ? [rand() < 0.5 ? 0 : 1] : [0, 1];

      const Xsub = rows.map((r) => features.map((f) => Xtr[r][f]));
      const ysub = rows.map((r) => ytr[r]);
      const tree = new DecisionTree(Xsub, ysub, TREE_PARAMS(cfg.maxDepth, cfg.seed + e * 101 + 1));
      this.bases.push({ tree, features });
    }
  }

  // P(class 1) as the fraction of base trees voting class 1 (hard vote share)
  proba(x: Point): number {
    let ones = 0;
    for (const b of this.bases) {
      const xf = b.features.map((f) => x[f]);
      if (b.tree.predict(xf) === 1) ones++;
    }
    return ones / this.bases.length;
  }

  predict(x: Point): number {
    return this.proba(x) >= 0.5 ? 1 : 0;
  }

  accuracy(X: Point[], y: number[]): number {
    let ok = 0;
    for (let i = 0; i < y.length; i++) if (this.predict(X[i]) === y[i]) ok++;
    return ok / y.length;
  }

  // one base tree's own boundary, as a proba function over the full 2-D point
  baseProba(i: number): (x: Point) => number {
    const b = this.bases[i];
    return (x: Point) => b.tree.predict(b.features.map((f) => x[f]));
  }

  baseAccuracy(i: number, X: Point[], y: number[]): number {
    const p = this.baseProba(i);
    let ok = 0;
    for (let j = 0; j < y.length; j++) if ((p(X[j]) >= 0.5 ? 1 : 0) === y[j]) ok++;
    return ok / y.length;
  }
}
