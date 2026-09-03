// A small CART implementation that runs in the browser so the decision-tree
// explorers can re-fit live on every slider change. Supports classification
// (gini / entropy) and regression (squared_error / friedman_mse /
// absolute_error), plus the same stopping hyperparameters sklearn exposes:
// max_depth, min_samples_split, min_samples_leaf, max_leaf_nodes,
// min_impurity_decrease, and the best / random splitter.

export type Task = 'classification' | 'regression';
export type Criterion =
  | 'gini'
  | 'entropy'
  | 'squared_error'
  | 'friedman_mse'
  | 'absolute_error';
export type Splitter = 'best' | 'random';

export interface TreeParams {
  task: Task;
  criterion: Criterion;
  splitter: Splitter;
  maxDepth: number; // 0 => unlimited
  minSamplesSplit: number; // >= 2
  minSamplesLeaf: number; // >= 1
  maxLeafNodes: number; // 0 or 1 => unlimited
  minImpurityDecrease: number;
  randomState?: number;
}

export interface TreeNode {
  leaf: boolean;
  value: number;
  n: number;
  impurity: number;
  depth: number;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

// Deterministic PRNG so the random splitter is reproducible across renders.
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

const EPS = 1e-12;

export class DecisionTree {
  private X: number[][];
  private y: number[];
  private p: TreeParams;
  private nTotal: number;
  private rand: () => number;
  root: TreeNode;
  leafCount = 0;

  constructor(X: number[][], y: number[], params: TreeParams) {
    this.X = X;
    this.y = y;
    this.p = params;
    this.nTotal = y.length;
    this.rand = mulberry32(params.randomState ?? 42);
    const allIdx = X.map((_, i) => i);
    const useBestFirst = params.maxLeafNodes && params.maxLeafNodes >= 2;
    this.root = useBestFirst ? this.buildBestFirst(allIdx) : this.buildDepthFirst(allIdx, 0);
  }

  // --- impurity + leaf value ------------------------------------------------
  private impurity(idx: number[]): number {
    const n = idx.length;
    if (n === 0) return 0;
    if (this.p.task === 'classification') {
      const counts = new Map<number, number>();
      for (const i of idx) counts.set(this.y[i], (counts.get(this.y[i]) ?? 0) + 1);
      if (this.p.criterion === 'entropy') {
        let h = 0;
        for (const c of counts.values()) {
          const pr = c / n;
          h -= pr * Math.log2(pr);
        }
        return h;
      }
      let g = 1;
      for (const c of counts.values()) g -= (c / n) ** 2;
      return g;
    }
    // regression
    if (this.p.criterion === 'absolute_error') {
      const med = this.median(idx);
      let s = 0;
      for (const i of idx) s += Math.abs(this.y[i] - med);
      return s / n;
    }
    const mean = this.mean(idx);
    let v = 0;
    for (const i of idx) v += (this.y[i] - mean) ** 2;
    return v / n;
  }

  private mean(idx: number[]): number {
    let s = 0;
    for (const i of idx) s += this.y[i];
    return s / idx.length;
  }

  private median(idx: number[]): number {
    const vals = idx.map((i) => this.y[i]).sort((a, b) => a - b);
    const m = vals.length >> 1;
    return vals.length % 2 ? vals[m] : (vals[m - 1] + vals[m]) / 2;
  }

  private leafValue(idx: number[]): number {
    if (this.p.task === 'regression') {
      return this.p.criterion === 'absolute_error' ? this.median(idx) : this.mean(idx);
    }
    const counts = new Map<number, number>();
    for (const i of idx) counts.set(this.y[i], (counts.get(this.y[i]) ?? 0) + 1);
    let best = 0;
    let bestCount = -1;
    for (const [cls, c] of counts) {
      if (c > bestCount || (c === bestCount && cls < best)) {
        best = cls;
        bestCount = c;
      }
    }
    return best;
  }

  // --- split search ------------------------------------------------------
  private bestSplit(
    idx: number[],
    parentImpurity: number
  ): { feature: number; threshold: number; left: number[]; right: number[]; score: number } | null {
    const nFeatures = this.X[0].length;
    const nT = idx.length;
    let best: {
      feature: number;
      threshold: number;
      left: number[];
      right: number[];
      score: number;
    } | null = null;

    for (let f = 0; f < nFeatures; f++) {
      const values = idx.map((i) => this.X[i][f]);
      let candidates: number[];
      if (this.p.splitter === 'random') {
        const lo = Math.min(...values);
        const hi = Math.max(...values);
        if (hi - lo < EPS) continue;
        candidates = [lo + this.rand() * (hi - lo)];
      } else {
        const uniq = Array.from(new Set(values)).sort((a, b) => a - b);
        if (uniq.length < 2) continue;
        candidates = [];
        for (let k = 0; k < uniq.length - 1; k++) candidates.push((uniq[k] + uniq[k + 1]) / 2);
      }

      for (const thr of candidates) {
        const left: number[] = [];
        const right: number[] = [];
        for (const i of idx) (this.X[i][f] <= thr ? left : right).push(i);
        if (left.length < this.p.minSamplesLeaf || right.length < this.p.minSamplesLeaf) continue;

        const impL = this.impurity(left);
        const impR = this.impurity(right);
        const nL = left.length;
        const nR = right.length;
        const weightedChild = (nL / nT) * impL + (nR / nT) * impR;
        const decrease = (nT / this.nTotal) * (parentImpurity - weightedChild);
        if (decrease < this.p.minImpurityDecrease - EPS) continue;

        let score: number;
        if (this.p.criterion === 'friedman_mse') {
          const mL = this.mean(left);
          const mR = this.mean(right);
          score = ((nL * nR) / nT) * (mL - mR) * (mL - mR);
        } else {
          score = parentImpurity - weightedChild;
        }
        if (score <= EPS) continue;
        if (!best || score > best.score) best = { feature: f, threshold: thr, left, right, score };
      }
    }
    return best;
  }

  private stopBeforeSplit(idx: number[], depth: number, impurity: number): boolean {
    if (this.p.maxDepth > 0 && depth >= this.p.maxDepth) return true;
    if (idx.length < this.p.minSamplesSplit) return true;
    if (idx.length < 2 * this.p.minSamplesLeaf) return true;
    if (impurity <= EPS) return true;
    return false;
  }

  // --- builders ---------------------------------------------------------
  private buildDepthFirst(idx: number[], depth: number): TreeNode {
    const impurity = this.impurity(idx);
    const node: TreeNode = {
      leaf: true,
      value: this.leafValue(idx),
      n: idx.length,
      impurity,
      depth,
    };
    if (this.stopBeforeSplit(idx, depth, impurity)) {
      this.leafCount++;
      return node;
    }
    const split = this.bestSplit(idx, impurity);
    if (!split) {
      this.leafCount++;
      return node;
    }
    node.leaf = false;
    node.feature = split.feature;
    node.threshold = split.threshold;
    node.left = this.buildDepthFirst(split.left, depth + 1);
    node.right = this.buildDepthFirst(split.right, depth + 1);
    return node;
  }

  private buildBestFirst(rootIdx: number[]): TreeNode {
    type Frontier = {
      node: TreeNode;
      idx: number[];
      split: ReturnType<DecisionTree['bestSplit']>;
    };
    const makeLeaf = (idx: number[], depth: number): TreeNode => ({
      leaf: true,
      value: this.leafValue(idx),
      n: idx.length,
      impurity: this.impurity(idx),
      depth,
    });

    const root = makeLeaf(rootIdx, 0);
    this.leafCount = 1;
    const frontier: Frontier[] = [];

    const consider = (node: TreeNode, idx: number[]) => {
      if (this.stopBeforeSplit(idx, node.depth, node.impurity)) return;
      const split = this.bestSplit(idx, node.impurity);
      if (split) frontier.push({ node, idx, split });
    };
    consider(root, rootIdx);

    while (this.leafCount < this.p.maxLeafNodes && frontier.length > 0) {
      let bi = 0;
      for (let k = 1; k < frontier.length; k++) {
        if (frontier[k].split!.score > frontier[bi].split!.score) bi = k;
      }
      const { node, split } = frontier.splice(bi, 1)[0];
      const s = split!;
      node.leaf = false;
      node.feature = s.feature;
      node.threshold = s.threshold;
      node.left = makeLeaf(s.left, node.depth + 1);
      node.right = makeLeaf(s.right, node.depth + 1);
      this.leafCount++; // one leaf replaced by two
      consider(node.left, s.left);
      consider(node.right, s.right);
    }
    return root;
  }

  // --- prediction + metrics -------------------------------------------
  predict(x: number[]): number {
    let node = this.root;
    while (!node.leaf) {
      node = x[node.feature!] <= node.threshold! ? node.left! : node.right!;
    }
    return node.value;
  }

  accuracy(X: number[][], y: number[]): number {
    let ok = 0;
    for (let i = 0; i < y.length; i++) if (this.predict(X[i]) === y[i]) ok++;
    return ok / y.length;
  }

  r2(X: number[][], y: number[]): number {
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < y.length; i++) {
      ssRes += (y[i] - this.predict(X[i])) ** 2;
      ssTot += (y[i] - mean) ** 2;
    }
    return ssTot < EPS ? 0 : 1 - ssRes / ssTot;
  }

  depth(): number {
    const walk = (n: TreeNode): number => (n.leaf ? n.depth : Math.max(walk(n.left!), walk(n.right!)));
    return walk(this.root);
  }
}
