'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DecisionTree, type Criterion, type Splitter, type TreeParams } from '../lib/decisionTree';

type Data = {
  train: { X: number[][]; y: number[] };
  test: { X: number[][]; y: number[] };
  bounds: { xmin: number; xmax: number; ymin: number; ymax: number };
};

const CW = 480;
const CH = 360;
const GRID_NX = 140;
const GRID_NY = 105;

const FILL = ['rgba(37,99,235,0.16)', 'rgba(220,38,38,0.16)'];
const POINT = ['#2563eb', '#dc2626'];

function stepper(
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

function slider(
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
  criterion: 'gini' as Criterion,
  splitter: 'best' as Splitter,
  maxDepth: 0,
  minSamplesSplit: 2,
  minSamplesLeaf: 1,
  maxLeafNodes: 0,
  minImpurityDecrease: 0,
};

export default function DecisionTreeHyperparameterExplorer() {
  const [data, setData] = useState<Data | null>(null);
  const [criterion, setCriterion] = useState<Criterion>(DEFAULTS.criterion);
  const [splitter, setSplitter] = useState<Splitter>(DEFAULTS.splitter);
  const [maxDepth, setMaxDepth] = useState(DEFAULTS.maxDepth);
  const [minSamplesSplit, setMinSamplesSplit] = useState(DEFAULTS.minSamplesSplit);
  const [minSamplesLeaf, setMinSamplesLeaf] = useState(DEFAULTS.minSamplesLeaf);
  const [maxLeafNodes, setMaxLeafNodes] = useState(DEFAULTS.maxLeafNodes);
  const [minImpurityDecrease, setMinImpurityDecrease] = useState(DEFAULTS.minImpurityDecrease);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetch('/data/ch39-decision-tree.json')
      .then((r) => r.json())
      .then(setData);
  }, []);

  const params: TreeParams = useMemo(
    () => ({
      task: 'classification',
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
    const tree = new DecisionTree(data.train.X, data.train.y, params);
    return {
      tree,
      trainAcc: tree.accuracy(data.train.X, data.train.y),
      testAcc: tree.accuracy(data.test.X, data.test.y),
      leaves: tree.leafCount,
      depth: tree.depth(),
    };
  }, [data, params]);

  useEffect(() => {
    if (!data || !fit) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { xmin, xmax, ymin, ymax } = data.bounds;
    const sx = (x: number) => ((x - xmin) / (xmax - xmin)) * CW;
    const sy = (y: number) => (1 - (y - ymin) / (ymax - ymin)) * CH;

    ctx.clearRect(0, 0, CW, CH);
    // Paint the decision regions on a tiny offscreen canvas at grid resolution
    // with opaque colours, then upscale with smoothing off: no seams, no
    // alpha-blend speckle where cells meet.
    const off = document.createElement('canvas');
    off.width = GRID_NX;
    off.height = GRID_NY;
    const octx = off.getContext('2d')!;
    for (let ix = 0; ix < GRID_NX; ix++) {
      const xv = xmin + ((xmax - xmin) * (ix + 0.5)) / GRID_NX;
      for (let iy = 0; iy < GRID_NY; iy++) {
        const yv = ymin + ((ymax - ymin) * (iy + 0.5)) / GRID_NY;
        octx.fillStyle = FILL[fit.tree.predict([xv, yv])] ?? FILL[0];
        octx.fillRect(ix, GRID_NY - 1 - iy, 1, 1);
      }
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, CW, CH);

    const drawPoints = (X: number[][], y: number[], filled: boolean) => {
      for (let i = 0; i < y.length; i++) {
        ctx.beginPath();
        ctx.arc(sx(X[i][0]), sy(X[i][1]), filled ? 3.1 : 3, 0, Math.PI * 2);
        if (filled) {
          ctx.fillStyle = POINT[y[i]] ?? POINT[0];
          ctx.fill();
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        } else {
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = POINT[y[i]] ?? POINT[0];
          ctx.stroke();
        }
      }
    };
    drawPoints(data.train.X, data.train.y, true);
    drawPoints(data.test.X, data.test.y, false);

    ctx.strokeStyle = 'rgba(120,120,120,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, CW - 1, CH - 1);
  }, [data, fit]);

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

  const gap = fit.trainAcc - fit.testAcc;
  const verdict =
    gap > 0.08 ? 'gap is wide: overfitting' : fit.trainAcc < 0.8 ? 'both low: underfitting' : 'train and test close';

  return (
    <div className="not-prose my-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-52 shrink-0 flex flex-col gap-3">
          <div className="text-sm font-bold">Decision Tree Classifier</div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Criterion</span>
            <select
              value={criterion}
              onChange={(e) => setCriterion(e.target.value as Criterion)}
              className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1 text-xs"
            >
              <option value="gini">gini</option>
              <option value="entropy">entropy</option>
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

          {stepper('Max Depth', maxDepth, setMaxDepth, { min: 0, max: 20, zeroIsNone: true })}
          {slider('Min Samples Split', minSamplesSplit, (n) => setMinSamplesSplit(Math.max(2, n)), { min: 2, max: 120 })}
          {slider('Min Samples Leaf', minSamplesLeaf, setMinSamplesLeaf, { min: 1, max: 120 })}
          {stepper('Max Leaf Nodes', maxLeafNodes, setMaxLeafNodes, { min: 0, max: 50, zeroIsNone: true })}
          {stepper('Min Impurity Decrease', minImpurityDecrease, setMinImpurityDecrease, { min: 0, max: 0.2, step: 0.005 })}

          <button
            type="button"
            onClick={reset}
            className="mt-1 rounded-lg border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10"
          >
            Reset
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="w-full h-auto rounded-lg border border-black/10 dark:border-white/10"
          />
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--text-secondary)] tabular-nums">
            <span>train acc <b className="text-[var(--text-primary)]">{fit.trainAcc.toFixed(3)}</b></span>
            <span>test acc <b className="text-[var(--text-primary)]">{fit.testAcc.toFixed(3)}</b></span>
            <span>leaves <b className="text-[var(--text-primary)]">{fit.leaves}</b></span>
            <span>depth <b className="text-[var(--text-primary)]">{fit.depth}</b></span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
            Filled dots = training points, hollow dots = held-out test points. {verdict}.
          </p>
        </div>
      </div>
    </div>
  );
}
