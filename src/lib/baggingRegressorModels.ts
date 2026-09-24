// Self-contained toy data + a bagging-regressor ensemble for the Ch.47
// bagging-regressor explorer. Mirrors src/lib/baggingModels.ts (the Ch.45
// classifier version) but the base learner is a regression tree and
// aggregation is a mean instead of a vote, matching BaggingRegressor.

import { DecisionTree, type TreeParams } from './decisionTree';

export interface RegDataset {
  Xtr: number[][];
  ytr: number[];
  Xte: number[][];
  yte: number[];
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

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

// Noisy 1-D curve: same shape as the video's Streamlit demo dataset, one
// feature, deliberately wiggly enough that a fully-grown tree overfits it.
export function makeRegressionDataset(seed = 42, n = 150): RegDataset {
  const rand = mulberry32(seed);
  const xs = Array.from({ length: n }, () => rand() * 10).sort((a, b) => a - b);
  const X: number[][] = [];
  const y: number[] = [];
  for (const x of xs) {
    X.push([x]);
    y.push(Math.sin(x) + 0.15 * x + gauss(rand) * 0.4);
  }
  const idx = X.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const cut = Math.floor(idx.length * 0.8);
  const pick = (ids: number[]) => ({ X: ids.map((i) => X[i]), y: ids.map((i) => y[i]) });
  const tr = pick(idx.slice(0, cut));
  const te = pick(idx.slice(cut));
  const ymin = Math.min(...y) - 0.3;
  const ymax = Math.max(...y) + 0.3;
  return { Xtr: tr.X, ytr: tr.y, Xte: te.X, yte: te.y, xmin: 0, xmax: 10, ymin, ymax };
}

export interface BaggingRegConfig {
  nEstimators: number;
  maxSamples: number; // fraction of training rows per base tree
  bootstrapRows: boolean; // true => with replacement (bagging), false => pasting
  seed: number;
}

const TREE_PARAMS = (randomState: number): TreeParams => ({
  task: 'regression',
  criterion: 'squared_error',
  splitter: 'best',
  maxDepth: 0,
  minSamplesSplit: 2,
  minSamplesLeaf: 1,
  maxLeafNodes: 0,
  minImpurityDecrease: 0,
  randomState,
});

export class BaggingRegressorEnsemble {
  bases: DecisionTree[] = [];

  constructor(Xtr: number[][], ytr: number[], cfg: BaggingRegConfig) {
    const rand = mulberry32(cfg.seed);
    const n = Xtr.length;
    const k = Math.max(2, Math.round(n * cfg.maxSamples));

    for (let e = 0; e < cfg.nEstimators; e++) {
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
      const Xsub = rows.map((r) => Xtr[r]);
      const ysub = rows.map((r) => ytr[r]);
      this.bases.push(new DecisionTree(Xsub, ysub, TREE_PARAMS(cfg.seed + e * 101 + 1)));
    }
  }

  predict(x: number[]): number {
    let s = 0;
    for (const t of this.bases) s += t.predict(x);
    return s / this.bases.length;
  }

  r2(X: number[][], y: number[]): number {
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < y.length; i++) {
      ssRes += (y[i] - this.predict(X[i])) ** 2;
      ssTot += (y[i] - mean) ** 2;
    }
    return ssTot < 1e-12 ? 0 : 1 - ssRes / ssTot;
  }
}
