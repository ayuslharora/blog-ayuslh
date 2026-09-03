'use client';

import { useEffect, useMemo, useState } from 'react';
import { DecisionTree, type Criterion, type Splitter, type TreeParams } from '../lib/decisionTree';

type Data = {
  train: { x: number[]; y: number[] };
  test: { x: number[]; y: number[] };
  bounds: { xmin: number; xmax: number; ymin: number; ymax: number };
};

const W = 640;
const H = 380;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 34;

const CRITERIA: Criterion[] = ['squared_error', 'friedman_mse', 'absolute_error'];

function labelStepper(
  label: string,
  value: number,
  set: (n: number) => void,
  { min, max, step = 1, zeroIsNone = false }: { min: number; max: number; step?: number; zeroIsNone?: boolean }
) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-stretch rounded-lg border border-black/10 dark:border-white/15 overflow-hidden">
        <span className="flex-1 px-2 py-1 text-xs tabular-nums">
          {zeroIsNone && value === 0 ? 'None' : Number.isInteger(step) ? value : value.toFixed(3)}
        </span>
        <button
          type="button"
          onClick={() => set(Math.max(min, +(value - step).toFixed(4)))}
          className="px-2 border-l border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
          aria-label={`decrease ${label}`}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => set(Math.min(max, +(value + step).toFixed(4)))}
          className="px-2 border-l border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
          aria-label={`increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function labelSlider(
  label: string,
  value: number,
  set: (n: number) => void,
  { min, max }: { min: number; max: number }
) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)]">
        <span>{label}</span>
        <span className="tabular-nums text-[var(--text-primary)]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

const DEFAULTS = {
  criterion: 'squared_error' as Criterion,
  splitter: 'best' as Splitter,
  maxDepth: 0,
  minSamplesSplit: 2,
  minSamplesLeaf: 1,
  maxLeafNodes: 0,
  minImpurityDecrease: 0,
};

export default function RegressionTreeExplorer() {
  const [data, setData] = useState<Data | null>(null);
  const [criterion, setCriterion] = useState<Criterion>(DEFAULTS.criterion);
  const [splitter, setSplitter] = useState<Splitter>(DEFAULTS.splitter);
  const [maxDepth, setMaxDepth] = useState(DEFAULTS.maxDepth);
  const [minSamplesSplit, setMinSamplesSplit] = useState(DEFAULTS.minSamplesSplit);
  const [minSamplesLeaf, setMinSamplesLeaf] = useState(DEFAULTS.minSamplesLeaf);
  const [maxLeafNodes, setMaxLeafNodes] = useState(DEFAULTS.maxLeafNodes);
  const [minImpurityDecrease, setMinImpurityDecrease] = useState(DEFAULTS.minImpurityDecrease);

  useEffect(() => {
    fetch('/data/ch40-regression-tree.json')
      .then((r) => r.json())
      .then(setData);
  }, []);

  const params: TreeParams = useMemo(
    () => ({
      task: 'regression',
      criterion,
      splitter,
      maxDepth,
      minSamplesSplit,
      minSamplesLeaf,
      maxLeafNodes,
      minImpurityDecrease,
      randomState: 42,
    }),
    [criterion, splitter, maxDepth, minSamplesSplit, minSamplesLeaf, maxLeafNodes, minImpurityDecrease]
  );

  const fit = useMemo(() => {
    if (!data) return null;
    const X = data.train.x.map((v) => [v]);
    const tree = new DecisionTree(X, data.train.y, params);
    const Xte = data.test.x.map((v) => [v]);
    const steps = 500;
    const { xmin, xmax } = data.bounds;
    const line: { x: number; y: number }[] = [];
    for (let i = 0; i < steps; i++) {
      const xv = xmin + ((xmax - xmin) * i) / (steps - 1);
      line.push({ x: xv, y: tree.predict([xv]) });
    }
    return {
      line,
      trainR2: tree.r2(X, data.train.y),
      testR2: tree.r2(Xte, data.test.y),
      leaves: tree.leafCount,
      depth: tree.depth(),
    };
  }, [data, params]);

  const reset = () => {
    setCriterion(DEFAULTS.criterion);
    setSplitter(DEFAULTS.splitter);
    setMaxDepth(DEFAULTS.maxDepth);
    setMinSamplesSplit(DEFAULTS.minSamplesSplit);
    setMinSamplesLeaf(DEFAULTS.minSamplesLeaf);
    setMaxLeafNodes(DEFAULTS.maxLeafNodes);
    setMinImpurityDecrease(DEFAULTS.minImpurityDecrease);
  };

  if (!data || !fit) {
    return <div className="animate-pulse h-[420px] w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8" />;
  }

  const { xmin, xmax, ymin, ymax } = data.bounds;
  const sx = (x: number) => PAD_L + ((x - xmin) / (xmax - xmin)) * (W - PAD_L - PAD_R);
  const sy = (y: number) => PAD_T + (1 - (y - ymin) / (ymax - ymin)) * (H - PAD_T - PAD_B);

  const xTicks = [-4, -2, 0, 2, 4].filter((t) => t >= xmin && t <= xmax);
  const yTicks = [0, 0.5, 1, 1.5].filter((t) => t >= ymin && t <= ymax);

  const linePath = fit.line
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
    .join(' ');

  return (
    <div className="not-prose my-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-52 shrink-0 flex flex-col gap-3">
          <div className="text-sm font-bold">Decision Tree Regressor</div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Criterion</span>
            <select
              value={criterion}
              onChange={(e) => setCriterion(e.target.value as Criterion)}
              className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1 text-xs"
            >
              {CRITERIA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Splitter</span>
            <select
              value={splitter}
              onChange={(e) => setSplitter(e.target.value as Splitter)}
              className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1 text-xs"
            >
              <option value="best">best</option>
              <option value="random">random</option>
            </select>
          </div>

          {labelStepper('Max Depth', maxDepth, setMaxDepth, { min: 0, max: 20, zeroIsNone: true })}
          {labelSlider('Min Samples Split', minSamplesSplit, (n) => setMinSamplesSplit(Math.max(2, n)), {
            min: 2,
            max: 150,
          })}
          {labelSlider('Min Samples Leaf', minSamplesLeaf, setMinSamplesLeaf, { min: 1, max: 150 })}
          {labelStepper('Max Leaf Nodes', maxLeafNodes, setMaxLeafNodes, { min: 0, max: 50, zeroIsNone: true })}
          {labelStepper('Min Impurity Decrease', minImpurityDecrease, setMinImpurityDecrease, {
            min: 0,
            max: 0.2,
            step: 0.005,
          })}

          <button
            type="button"
            onClick={reset}
            className="mt-1 rounded-lg border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10"
          >
            Reset
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Regression tree prediction over a 1-D dataset">
            {yTicks.map((t) => (
              <g key={`y${t}`}>
                <line x1={PAD_L} x2={W - PAD_R} y1={sy(t)} y2={sy(t)} stroke="currentColor" strokeOpacity={0.12} />
                <text x={PAD_L - 6} y={sy(t) + 3} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.5}>
                  {t}
                </text>
              </g>
            ))}
            {xTicks.map((t) => (
              <g key={`x${t}`}>
                <line x1={sx(t)} x2={sx(t)} y1={PAD_T} y2={H - PAD_B} stroke="currentColor" strokeOpacity={0.08} />
                <text x={sx(t)} y={H - PAD_B + 16} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.5}>
                  {t}
                </text>
              </g>
            ))}

            {data.train.x.map((xv, i) => (
              <circle key={`tr${i}`} cx={sx(xv)} cy={sy(data.train.y[i])} r={3} fill="#facc15" stroke="#a16207" strokeWidth={0.7} />
            ))}
            {data.test.x.map((xv, i) => (
              <circle key={`te${i}`} cx={sx(xv)} cy={sy(data.test.y[i])} r={3} fill="none" stroke="#64748b" strokeWidth={1} />
            ))}

            <path d={linePath} fill="none" stroke="#dc2626" strokeWidth={2.2} />
          </svg>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--text-secondary)] tabular-nums">
            <span>train R² <b className="text-[var(--text-primary)]">{fit.trainR2.toFixed(3)}</b></span>
            <span>test R² <b className="text-[var(--text-primary)]">{fit.testR2.toFixed(3)}</b></span>
            <span>leaves <b className="text-[var(--text-primary)]">{fit.leaves}</b></span>
            <span>depth <b className="text-[var(--text-primary)]">{fit.depth}</b></span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
            Yellow = training points, hollow grey = held-out test points, red = the tree&apos;s piecewise-constant prediction.
          </p>
        </div>
      </div>
    </div>
  );
}
