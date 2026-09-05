// Self-contained toy classifiers + toy 2-D datasets for the Ch.43 voting
// explorer. Each classifier exposes fit(X, y) returning { predictProba,
// accuracy } so the component can treat all five estimators uniformly and
// combine them with hard or (weight-averaged) soft voting.
//
// These are deliberately small approximations, not sklearn ports: SVM here
// is a kernel-logistic-regression fit with an RBF kernel (same nonlinear
// decision-boundary shape a real RBF-SVM produces), and Random Forest is a
// bootstrap-bagged ensemble of the site's existing CART implementation.

import { DecisionTree, type TreeParams } from './decisionTree';

export type Point = [number, number];

export interface Dataset {
  X: Point[];
  y: number[];
  bounds: { xmin: number; xmax: number; ymin: number; ymax: number };
}

export interface Fitted {
  predictProba: (x: Point) => number; // P(class 1)
  accuracy: number;
}

// --- deterministic RNG -------------------------------------------------
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

// --- toy datasets --------------------------------------------------------
export type DatasetName = 'u-shaped' | 'linear' | 'outlier' | 'two-spirals' | 'concentric' | 'xor';

const BOUNDS = { xmin: -3, xmax: 3, ymin: -3, ymax: 3 };

export function makeDataset(name: DatasetName, seed = 7): Dataset {
  const rand = mulberry32(seed);
  const X: Point[] = [];
  const y: number[] = [];
  const n = 60; // per class, roughly

  if (name === 'linear') {
    for (let i = 0; i < n * 2; i++) {
      const x0 = -2.5 + rand() * 5;
      const x1 = -2.5 + rand() * 5;
      const cls = x1 > 0.4 * x0 - 0.2 ? 1 : 0;
      X.push([x0 + gauss(rand) * 0.15, x1 + gauss(rand) * 0.15]);
      y.push(cls);
    }
  } else if (name === 'u-shaped') {
    for (let i = 0; i < n; i++) {
      const t = -2 + (4 * i) / n;
      X.push([t + gauss(rand) * 0.3, 0.6 * t * t - 1 + gauss(rand) * 0.3]);
      y.push(0);
    }
    for (let i = 0; i < n; i++) {
      const t = -2 + (4 * i) / n;
      X.push([t + gauss(rand) * 0.3, 0.6 * t * t + 0.6 + gauss(rand) * 0.3]);
      y.push(1);
    }
  } else if (name === 'outlier') {
    for (let i = 0; i < n * 2; i++) {
      const cls = i % 2;
      const cx = cls === 0 ? -1 : 1;
      X.push([cx + gauss(rand) * 0.5, gauss(rand) * 0.5]);
      y.push(cls);
    }
    // a handful of mislabelled / far-flung points, same as the video's "outlier" preset
    X.push([-1, 2.4]);
    y.push(1);
    X.push([1, -2.4]);
    y.push(0);
    X.push([2.6, 0.1]);
    y.push(0);
  } else if (name === 'two-spirals') {
    for (let cls = 0; cls < 2; cls++) {
      for (let i = 0; i < n; i++) {
        const t = (i / n) * 3.2 + 0.3;
        const angle = t * 2.4 + (cls === 1 ? Math.PI : 0);
        const r = t * 0.75;
        X.push([r * Math.cos(angle) + gauss(rand) * 0.08, r * Math.sin(angle) + gauss(rand) * 0.08]);
        y.push(cls);
      }
    }
  } else if (name === 'concentric') {
    for (let i = 0; i < n; i++) {
      const a = rand() * 2 * Math.PI;
      const r = 0.6 + gauss(rand) * 0.2;
      X.push([r * Math.cos(a), r * Math.sin(a)]);
      y.push(0);
    }
    for (let i = 0; i < n; i++) {
      const a = rand() * 2 * Math.PI;
      const r = 2.1 + gauss(rand) * 0.2;
      X.push([r * Math.cos(a), r * Math.sin(a)]);
      y.push(1);
    }
  } else if (name === 'xor') {
    for (let i = 0; i < n * 2; i++) {
      const x0 = -2.5 + rand() * 5;
      const x1 = -2.5 + rand() * 5;
      const cls = x0 * x1 > 0 ? 1 : 0;
      X.push([x0, x1]);
      y.push(cls);
    }
  }

  return { X, y, bounds: BOUNDS };
}

// --- Logistic Regression (linear, gradient descent) -----------------------
export function fitLogisticRegression(X: Point[], y: number[]): Fitted {
  const n = X.length;
  let w0 = 0,
    w1 = 0,
    w2 = 0;
  const lr = 0.15;
  const l2 = 1e-3;
  for (let epoch = 0; epoch < 400; epoch++) {
    let g0 = 0,
      g1 = 0,
      g2 = 0;
    for (let i = 0; i < n; i++) {
      const z = w0 + w1 * X[i][0] + w2 * X[i][1];
      const p = 1 / (1 + Math.exp(-z));
      const err = p - y[i];
      g0 += err;
      g1 += err * X[i][0];
      g2 += err * X[i][1];
    }
    w0 -= (lr * g0) / n;
    w1 -= (lr * g1) / n + lr * l2 * w1;
    w2 -= (lr * g2) / n + lr * l2 * w2;
  }
  const predictProba = (x: Point) => 1 / (1 + Math.exp(-(w0 + w1 * x[0] + w2 * x[1])));
  let correct = 0;
  for (let i = 0; i < n; i++) if ((predictProba(X[i]) >= 0.5 ? 1 : 0) === y[i]) correct++;
  return { predictProba, accuracy: correct / n };
}

// --- KNN --------------------------------------------------------------
export function fitKnn(X: Point[], y: number[], k = 7): Fitted {
  const predictProba = (x: Point) => {
    const d = X.map((xi, i) => ({ dist: (xi[0] - x[0]) ** 2 + (xi[1] - x[1]) ** 2, y: y[i] }));
    d.sort((a, b) => a.dist - b.dist);
    const nn = d.slice(0, Math.min(k, d.length));
    return nn.reduce((s, p) => s + p.y, 0) / nn.length;
  };
  let correct = 0;
  for (let i = 0; i < X.length; i++) {
    // leave-one-out-ish: exclude self by nudging (cheap approx, fine for a demo accuracy readout)
    const others = X.map((_, j) => j).filter((j) => j !== i);
    const d = others
      .map((j) => ({ dist: (X[j][0] - X[i][0]) ** 2 + (X[j][1] - X[i][1]) ** 2, y: y[j] }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, Math.min(k, others.length));
    const p = d.reduce((s, pt) => s + pt.y, 0) / d.length;
    if ((p >= 0.5 ? 1 : 0) === y[i]) correct++;
  }
  return { predictProba, accuracy: correct / X.length };
}

// --- "SVM": RBF-kernel logistic regression (dual weights) -----------------
export function fitSvmRbf(X: Point[], y: number[], gamma = 0.9): Fitted {
  const n = X.length;
  const K: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++) {
      const d2 = (X[i][0] - X[j][0]) ** 2 + (X[i][1] - X[j][1]) ** 2;
      const k = Math.exp(-gamma * d2);
      K[i][j] = k;
      K[j][i] = k;
    }
  const alpha = new Array(n).fill(0);
  let b = 0;
  const lr = 0.05;
  const l2 = 5e-3;
  for (let epoch = 0; epoch < 150; epoch++) {
    const scores = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let s = b;
      for (let j = 0; j < n; j++) s += alpha[j] * K[i][j];
      scores[i] = s;
    }
    const grad = scores.map((s, i) => 1 / (1 + Math.exp(-s)) - y[i]);
    let gb = 0;
    for (let i = 0; i < n; i++) gb += grad[i];
    b -= (lr * gb) / n;
    for (let j = 0; j < n; j++) {
      let gj = 0;
      for (let i = 0; i < n; i++) gj += grad[i] * K[i][j];
      alpha[j] -= (lr * gj) / n + lr * l2 * alpha[j];
    }
  }
  const predictProba = (x: Point) => {
    let s = b;
    for (let j = 0; j < n; j++) {
      const d2 = (X[j][0] - x[0]) ** 2 + (X[j][1] - x[1]) ** 2;
      s += alpha[j] * Math.exp(-gamma * d2);
    }
    return 1 / (1 + Math.exp(-s));
  };
  let correct = 0;
  for (let i = 0; i < n; i++) if ((predictProba(X[i]) >= 0.5 ? 1 : 0) === y[i]) correct++;
  return { predictProba, accuracy: correct / n };
}

// --- Random Forest: bagged CART trees (reuses src/lib/decisionTree.ts) ----
export function fitRandomForest(X: Point[], y: number[], nTrees = 15, seed = 3): Fitted {
  const rand = mulberry32(seed);
  const n = X.length;
  const params: TreeParams = {
    task: 'classification',
    criterion: 'gini',
    splitter: 'best',
    maxDepth: 4,
    minSamplesSplit: 4,
    minSamplesLeaf: 2,
    maxLeafNodes: 0,
    minImpurityDecrease: 0,
  };
  const trees: DecisionTree[] = [];
  for (let t = 0; t < nTrees; t++) {
    const idx: number[] = [];
    for (let i = 0; i < n; i++) idx.push(Math.floor(rand() * n));
    const Xb = idx.map((i) => X[i]);
    const yb = idx.map((i) => y[i]);
    trees.push(new DecisionTree(Xb, yb, { ...params, randomState: seed + t }));
  }
  const predictProba = (x: Point) => trees.reduce((s, tr) => s + tr.predict([x[0], x[1]]), 0) / trees.length;
  let correct = 0;
  for (let i = 0; i < n; i++) if ((predictProba(X[i]) >= 0.5 ? 1 : 0) === y[i]) correct++;
  return { predictProba, accuracy: correct / n };
}

// --- Gaussian Naive Bayes ------------------------------------------------
export function fitNaiveBayes(X: Point[], y: number[]): Fitted {
  const byClass: Record<number, Point[]> = { 0: [], 1: [] };
  X.forEach((x, i) => byClass[y[i]].push(x));
  const stats = [0, 1].map((c) => {
    const pts = byClass[c];
    const mean: Point = [
      pts.reduce((s, p) => s + p[0], 0) / pts.length,
      pts.reduce((s, p) => s + p[1], 0) / pts.length,
    ];
    const varr: Point = [
      pts.reduce((s, p) => s + (p[0] - mean[0]) ** 2, 0) / pts.length + 1e-3,
      pts.reduce((s, p) => s + (p[1] - mean[1]) ** 2, 0) / pts.length + 1e-3,
    ];
    return { mean, varr, prior: pts.length / X.length };
  });
  const logLik = (x: Point, s: (typeof stats)[number]) => {
    const d0 = -0.5 * Math.log(2 * Math.PI * s.varr[0]) - ((x[0] - s.mean[0]) ** 2) / (2 * s.varr[0]);
    const d1 = -0.5 * Math.log(2 * Math.PI * s.varr[1]) - ((x[1] - s.mean[1]) ** 2) / (2 * s.varr[1]);
    return d0 + d1 + Math.log(s.prior);
  };
  const predictProba = (x: Point) => {
    const l0 = logLik(x, stats[0]);
    const l1 = logLik(x, stats[1]);
    const m = Math.max(l0, l1);
    const e0 = Math.exp(l0 - m);
    const e1 = Math.exp(l1 - m);
    return e1 / (e0 + e1);
  };
  let correct = 0;
  for (let i = 0; i < X.length; i++) if ((predictProba(X[i]) >= 0.5 ? 1 : 0) === y[i]) correct++;
  return { predictProba, accuracy: correct / X.length };
}

export type EstimatorKey = 'lr' | 'knn' | 'svm' | 'rf' | 'nb';

export const ESTIMATOR_LABEL: Record<EstimatorKey, string> = {
  lr: 'Logistic Regression',
  knn: 'KNN',
  svm: 'SVM',
  rf: 'Random Forest',
  nb: 'Naive Bayes',
};

export function fitEstimator(key: EstimatorKey, X: Point[], y: number[]): Fitted {
  switch (key) {
    case 'lr':
      return fitLogisticRegression(X, y);
    case 'knn':
      return fitKnn(X, y);
    case 'svm':
      return fitSvmRbf(X, y);
    case 'rf':
      return fitRandomForest(X, y);
    case 'nb':
      return fitNaiveBayes(X, y);
  }
}

// hard: majority of {0,1} predictions. soft: mean of predict_proba.
export function votingPredictProba(fits: Fitted[], x: Point, voting: 'hard' | 'soft'): number {
  if (voting === 'soft') {
    return fits.reduce((s, f) => s + f.predictProba(x), 0) / fits.length;
  }
  const votes = fits.reduce((s, f) => s + (f.predictProba(x) >= 0.5 ? 1 : 0), 0);
  return votes / fits.length; // used both as boundary field and as a 0..1 "confidence"
}

export function votingAccuracy(fits: Fitted[], X: Point[], y: number[], voting: 'hard' | 'soft'): number {
  let correct = 0;
  for (let i = 0; i < X.length; i++) {
    const p = votingPredictProba(fits, X[i], voting);
    if ((p >= 0.5 ? 1 : 0) === y[i]) correct++;
  }
  return correct / X.length;
}
