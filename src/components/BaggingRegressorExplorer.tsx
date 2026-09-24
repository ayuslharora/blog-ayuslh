'use client';

import { useMemo, useState } from 'react';
import { DecisionTree, type TreeParams } from '../lib/decisionTree';
import { BaggingRegressorEnsemble, makeRegressionDataset, type BaggingRegConfig } from '../lib/baggingRegressorModels';

const W = 420;
const H = 300;
const PAD = { l: 34, r: 10, t: 10, b: 26 };
const N_GRID = 160;

const SINGLE_TREE_PARAMS: TreeParams = {
  task: 'regression',
  criterion: 'squared_error',
  splitter: 'best',
  maxDepth: 0,
  minSamplesSplit: 2,
  minSamplesLeaf: 1,
  maxLeafNodes: 0,
  minImpurityDecrease: 0,
  randomState: 42,
};

function usePlotters(xmin: number, xmax: number, ymin: number, ymax: number) {
  const sx = (x: number) => PAD.l + ((x - xmin) / (xmax - xmin)) * (W - PAD.l - PAD.r);
  const sy = (y: number) => H - PAD.b - ((y - ymin) / (ymax - ymin)) * (H - PAD.t - PAD.b);
  return { sx, sy };
}

function Panel({
  title,
  trainR2,
  testR2,
  curve,
  Xtr,
  ytr,
  Xte,
  yte,
  bounds,
  curveColor,
}: {
  title: string;
  trainR2: number;
  testR2: number;
  curve: { x: number; y: number }[];
  Xtr: number[][];
  ytr: number[];
  Xte: number[][];
  yte: number[];
  bounds: { xmin: number; xmax: number; ymin: number; ymax: number };
  curveColor: string;
}) {
  const { sx, sy } = usePlotters(bounds.xmin, bounds.xmax, bounds.ymin, bounds.ymax);
  const path = curve.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');

  return (
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-semibold text-center mb-1">{title}</div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black/30"
      >
        <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} fill="none" />
        {Xtr.map((x, i) => (
          <circle key={`tr-${i}`} cx={sx(x[0]).toFixed(2)} cy={sy(ytr[i]).toFixed(2)} r={2.4} fill="#94a3b8" />
        ))}
        {Xte.map((x, i) => (
          <circle key={`te-${i}`} cx={sx(x[0]).toFixed(2)} cy={sy(yte[i]).toFixed(2)} r={2.6} fill="#f97316" />
        ))}
        <path d={path} fill="none" stroke={curveColor} strokeWidth={2} />
        <line
          x1={PAD.l}
          y1={H - PAD.b}
          x2={W - PAD.r}
          y2={H - PAD.b}
          stroke="currentColor"
          className="text-[var(--text-secondary)]"
          strokeWidth={1}
        />
        <line
          x1={PAD.l}
          y1={PAD.t}
          x2={PAD.l}
          y2={H - PAD.b}
          stroke="currentColor"
          className="text-[var(--text-secondary)]"
          strokeWidth={1}
        />
      </svg>
      <div className="mt-1 text-[11px] text-center tabular-nums text-[var(--text-secondary)]">
        train R² <b className="text-[var(--text-primary)]">{trainR2.toFixed(3)}</b> · test R²{' '}
        <b className="text-[var(--text-primary)]">{testR2.toFixed(3)}</b>
      </div>
    </div>
  );
}

export default function BaggingRegressorExplorer() {
  const [nEstimators, setNEstimators] = useState(50);
  const [maxSamples, setMaxSamples] = useState(0.25);
  const [bootstrapRows, setBootstrapRows] = useState(true);

  const dataset = useMemo(() => makeRegressionDataset(42, 150), []);

  const xGrid = useMemo(
    () =>
      Array.from({ length: N_GRID }, (_, i) => dataset.xmin + ((dataset.xmax - dataset.xmin) * i) / (N_GRID - 1)),
    [dataset]
  );

  const singleTree = useMemo(() => new DecisionTree(dataset.Xtr, dataset.ytr, SINGLE_TREE_PARAMS), [dataset]);
  const singleCurve = useMemo(() => xGrid.map((x) => ({ x, y: singleTree.predict([x]) })), [xGrid, singleTree]);
  const singleTrainR2 = useMemo(() => singleTree.r2(dataset.Xtr, dataset.ytr), [singleTree, dataset]);
  const singleTestR2 = useMemo(() => singleTree.r2(dataset.Xte, dataset.yte), [singleTree, dataset]);

  const ensemble = useMemo(() => {
    const cfg: BaggingRegConfig = { nEstimators, maxSamples, bootstrapRows, seed: 12 };
    return new BaggingRegressorEnsemble(dataset.Xtr, dataset.ytr, cfg);
  }, [dataset, nEstimators, maxSamples, bootstrapRows]);
  const bagCurve = useMemo(() => xGrid.map((x) => ({ x, y: ensemble.predict([x]) })), [xGrid, ensemble]);
  const bagTrainR2 = useMemo(() => ensemble.r2(dataset.Xtr, dataset.ytr), [ensemble, dataset]);
  const bagTestR2 = useMemo(() => ensemble.r2(dataset.Xte, dataset.yte), [ensemble, dataset]);

  return (
    <div className="not-prose my-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0 flex flex-col gap-3">
          <div className="text-sm font-bold">Bagging Regressor Explorer</div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] tabular-nums">
              n_estimators: {nEstimators}
            </span>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={nEstimators}
              onChange={(e) => setNEstimators(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] tabular-nums">
              max_samples: {maxSamples.toFixed(2)}
            </span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={maxSamples}
              onChange={(e) => setMaxSamples(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">bootstrap</span>
            <div className="flex gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={bootstrapRows} onChange={() => setBootstrapRows(true)} />
                True
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={!bootstrapRows} onChange={() => setBootstrapRows(false)} />
                False
              </label>
            </div>
          </div>

          <div className="mt-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] p-2.5 text-xs">
            <div className="tabular-nums flex flex-col gap-0.5">
              <span>
                Ensemble test R²: <b>{bagTestR2.toFixed(3)}</b>
              </span>
              <span className="text-[var(--text-secondary)]">
                vs single tree test R²: <b className="text-[var(--text-primary)]">{singleTestR2.toFixed(3)}</b>
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-3">
          <Panel
            title="Single Decision Tree (fully grown)"
            trainR2={singleTrainR2}
            testR2={singleTestR2}
            curve={singleCurve}
            Xtr={dataset.Xtr}
            ytr={dataset.ytr}
            Xte={dataset.Xte}
            yte={dataset.yte}
            bounds={dataset}
            curveColor="#dc2626"
          />
          <Panel
            title={`Bagging (${nEstimators} trees)`}
            trainR2={bagTrainR2}
            testR2={bagTestR2}
            curve={bagCurve}
            Xtr={dataset.Xtr}
            ytr={dataset.ytr}
            Xte={dataset.Xte}
            yte={dataset.yte}
            bounds={dataset}
            curveColor="#2563eb"
          />
        </div>
      </div>
      <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
        Grey = training points, orange = held-out test points. Drag the sliders: fewer rows per tree or dropping
        bootstrap toward pasting changes how smooth the bagged curve gets and how it trades off against the single
        tree on the left, which never changes.
      </p>
    </div>
  );
}
