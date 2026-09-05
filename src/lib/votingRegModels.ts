// Self-contained toy regressors + toy 1-D datasets for the Ch.44 voting
// regressor explorer. Each regressor exposes fit(X, y) returning
// { predict, r2 } so the component can treat all three estimators
// uniformly and combine them by averaging predictions (what
// sklearn's VotingRegressor does).
//
// These are small from-scratch approximations, not sklearn ports: "SVR"
// here is an RBF-kernel ridge fit (same smooth nonlinear curve shape a
// real RBF-SVR produces), and the decision tree reuses the site's
// existing CART implementation in regression mode.

import { DecisionTree, type TreeParams } from './decisionTree';

export interface Dataset1D {
  X: number[];
  y: number[];
  xmin: number;
  xmax: number;
}

export interface FittedReg {
  predict: (x: number) => number;
  r2: number;
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

function r2Score(yTrue: number[], yPred: number[]): number {
  const mean = yTrue.reduce((a, b) => a + b, 0) / yTrue.length;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < yTrue.length; i++) {
    ssRes += (yTrue[i] - yPred[i]) ** 2;
    ssTot += (yTrue[i] - mean) ** 2;
  }
  return ssTot < 1e-9 ? 0 : 1 - ssRes / ssTot;
}

// --- toy datasets --------------------------------------------------------
export type DatasetName1D = 'linear-noisy' | 'sine-wave' | 'step' | 'outlier';

export function makeDataset1D(name: DatasetName1D, seed = 11): Dataset1D {
  const rand = mulberry32(seed);
  const X: number[] = [];
  const y: number[] = [];
  const n = 90;

  if (name === 'linear-noisy') {
    for (let i = 0; i < n; i++) {
      const x = -3 + (6 * i) / n;
      X.push(x);
      y.push(1.2 * x + 0.5 + gauss(rand) * 0.9);
    }
  } else if (name === 'sine-wave') {
    for (let i = 0; i < n; i++) {
      const x = -3 + (6 * i) / n;
      X.push(x);
      y.push(2.2 * Math.sin(1.3 * x) + gauss(rand) * 0.4);
    }
  } else if (name === 'step') {
    for (let i = 0; i < n; i++) {
      const x = -3 + (6 * i) / n;
      X.push(x);
      y.push((x < 0 ? -1.5 : 1.8) + gauss(rand) * 0.35);
    }
  } else if (name === 'outlier') {
    for (let i = 0; i < n; i++) {
      const x = -3 + (6 * i) / n;
      X.push(x);
      y.push(0.8 * x + gauss(rand) * 0.5);
    }
    // a handful of far-flung points, same spirit as the video's outlier demo
    X.push(-2.6, -0.2, 2.7);
    y.push(6, 7.5, -6);
  }

  return { X, y, xmin: -3.2, xmax: 3.2 };
}

// --- Linear Regression (least squares, closed form) ------------------------
export function fitLinearReg(X: number[], y: number[]): FittedReg {
  const n = X.length;
  const xMean = X.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += (X[i] - xMean) * (y[i] - yMean);
    den += (X[i] - xMean) ** 2;
  }
  const slope = den < 1e-9 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  const predict = (x: number) => slope * x + intercept;
  return { predict, r2: r2Score(y, X.map(predict)) };
}

// --- "SVR": RBF-kernel ridge regression (dual weights) ---------------------
export function fitSvrRbf(X: number[], y: number[], gamma = 0.7, l2 = 0.15): FittedReg {
  const n = X.length;
  const K: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++) {
      const k = Math.exp(-gamma * (X[i] - X[j]) ** 2);
      K[i][j] = k;
      K[j][i] = k;
    }
  // Solve (K + l2*I) alpha = y via Gauss-Seidel (small n, good enough for a demo)
  const alpha = new Array(n).fill(0);
  for (let iter = 0; iter < 300; iter++) {
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = 0; j < n; j++) if (j !== i) s += K[i][j] * alpha[j];
      alpha[i] = (y[i] - s) / (K[i][i] + l2);
    }
  }
  const predict = (x: number) => {
    let s = 0;
    for (let j = 0; j < n; j++) s += alpha[j] * Math.exp(-gamma * (X[j] - x) ** 2);
    return s;
  };
  return { predict, r2: r2Score(y, X.map(predict)) };
}

// --- Decision Tree Regressor (reuses src/lib/decisionTree.ts) --------------
export function fitTreeReg(X: number[], y: number[], maxDepth = 3): FittedReg {
  const params: TreeParams = {
    task: 'regression',
    criterion: 'squared_error',
    splitter: 'best',
    maxDepth,
    minSamplesSplit: 4,
    minSamplesLeaf: 2,
    maxLeafNodes: 0,
    minImpurityDecrease: 0,
  };
  const tree = new DecisionTree(
    X.map((x) => [x]),
    y,
    params
  );
  const predict = (x: number) => tree.predict([x]);
  return { predict, r2: r2Score(y, X.map(predict)) };
}

export type RegEstimatorKey = 'lr' | 'svr' | 'tree';

export const REG_ESTIMATOR_LABEL: Record<RegEstimatorKey, string> = {
  lr: 'Linear Regression',
  svr: 'SVR',
  tree: 'Decision Tree',
};

export function fitRegEstimator(key: RegEstimatorKey, X: number[], y: number[]): FittedReg {
  switch (key) {
    case 'lr':
      return fitLinearReg(X, y);
    case 'svr':
      return fitSvrRbf(X, y);
    case 'tree':
      return fitTreeReg(X, y);
  }
}

export function votingPredict(fits: FittedReg[], x: number, weights?: number[]): number {
  if (!weights) return fits.reduce((s, f) => s + f.predict(x), 0) / fits.length;
  const wsum = weights.reduce((a, b) => a + b, 0);
  return fits.reduce((s, f, i) => s + f.predict(x) * weights[i], 0) / wsum;
}

export function votingR2(fits: FittedReg[], X: number[], y: number[], weights?: number[]): number {
  const preds = X.map((x) => votingPredict(fits, x, weights));
  return r2Score(y, preds);
}
