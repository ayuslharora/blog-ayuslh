'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ESTIMATOR_LABEL,
  fitEstimator,
  makeDataset,
  votingAccuracy,
  votingPredictProba,
  type Dataset,
  type DatasetName,
  type EstimatorKey,
  type Fitted,
} from '../lib/votingModels';

const DATASETS: { key: DatasetName; label: string }[] = [
  { key: 'u-shaped', label: 'U-Shaped' },
  { key: 'linear', label: 'Linear' },
  { key: 'outlier', label: 'Outlier' },
  { key: 'two-spirals', label: 'Two Spirals' },
  { key: 'concentric', label: 'Concentric Circles' },
  { key: 'xor', label: 'XOR' },
];

const ESTIMATOR_KEYS: EstimatorKey[] = ['lr', 'knn', 'svm', 'rf', 'nb'];

const CW = 460;
const CH = 340;
const GRID_NX = 110;
const GRID_NY = 82;
const SCW = 190;
const SCH = 140;
const SGRID_NX = 64;
const SGRID_NY = 47;

const FILL = ['rgba(37,99,235,0.16)', 'rgba(220,38,38,0.16)'];
const POINT = ['#2563eb', '#dc2626'];

function paintBoundary(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  gnx: number,
  gny: number,
  bounds: Dataset['bounds'],
  probaAt: (x: number, y: number) => number,
  X: [number, number][],
  y: number[],
  pointRadius: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { xmin, xmax, ymin, ymax } = bounds;
  const sx = (x: number) => ((x - xmin) / (xmax - xmin)) * w;
  const sy = (yy: number) => (1 - (yy - ymin) / (ymax - ymin)) * h;

  ctx.clearRect(0, 0, w, h);
  const off = document.createElement('canvas');
  off.width = gnx;
  off.height = gny;
  const octx = off.getContext('2d')!;
  for (let ix = 0; ix < gnx; ix++) {
    const xv = xmin + ((xmax - xmin) * (ix + 0.5)) / gnx;
    for (let iy = 0; iy < gny; iy++) {
      const yv = ymin + ((ymax - ymin) * (iy + 0.5)) / gny;
      const p = probaAt(xv, yv);
      octx.fillStyle = FILL[p >= 0.5 ? 1 : 0];
      octx.fillRect(ix, gny - 1 - iy, 1, 1);
    }
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, w, h);

  for (let i = 0; i < y.length; i++) {
    ctx.beginPath();
    ctx.arc(sx(X[i][0]), sy(X[i][1]), pointRadius, 0, Math.PI * 2);
    ctx.fillStyle = POINT[y[i]];
    ctx.fill();
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(120,120,120,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

export default function VotingClassifierExplorer() {
  const [datasetName, setDatasetName] = useState<DatasetName>('u-shaped');
  const [selected, setSelected] = useState<EstimatorKey[]>(['lr', 'svm', 'rf']);
  const [voting, setVoting] = useState<'hard' | 'soft'>('hard');

  const mainRef = useRef<HTMLCanvasElement | null>(null);
  const smallRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const dataset = useMemo(() => makeDataset(datasetName), [datasetName]);

  const fits = useMemo(() => {
    const out: Record<EstimatorKey, Fitted> = {} as Record<EstimatorKey, Fitted>;
    for (const key of selected) out[key] = fitEstimator(key, dataset.X, dataset.y);
    return out;
  }, [dataset, selected]);

  const ensembleAcc = useMemo(() => {
    if (selected.length === 0) return 0;
    const list = selected.map((k) => fits[k]);
    return votingAccuracy(list, dataset.X, dataset.y, voting);
  }, [fits, selected, dataset, voting]);

  useEffect(() => {
    const canvas = mainRef.current;
    if (!canvas || selected.length === 0) return;
    const list = selected.map((k) => fits[k]);
    paintBoundary(
      canvas,
      CW,
      CH,
      GRID_NX,
      GRID_NY,
      dataset.bounds,
      (x, yv) => votingPredictProba(list, [x, yv], voting),
      dataset.X,
      dataset.y,
      3.2
    );
  }, [fits, selected, dataset, voting]);

  useEffect(() => {
    for (const key of selected) {
      const canvas = smallRefs.current[key];
      if (!canvas) continue;
      const f = fits[key];
      paintBoundary(
        canvas,
        SCW,
        SCH,
        SGRID_NX,
        SGRID_NY,
        dataset.bounds,
        (x, yv) => f.predictProba([x, yv]),
        dataset.X,
        dataset.y,
        1.8
      );
    }
  }, [fits, selected, dataset]);

  const toggleEstimator = (key: EstimatorKey) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 4) return prev; // keep the demo readable
      return [...prev, key];
    });
  };

  return (
    <div className="not-prose my-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0 flex flex-col gap-3">
          <div className="text-sm font-bold">Voting Classifier</div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Dataset</span>
            <select
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value as DatasetName)}
              className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1 text-xs"
            >
              {DATASETS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              Estimators <span className="font-normal">(2-4)</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ESTIMATOR_KEYS.map((key) => {
                const on = selected.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleEstimator(key)}
                    className={`rounded-full px-2.5 py-1 text-[11px] border transition-colors ${
                      on
                        ? 'bg-[#2563eb] border-[#2563eb] text-white'
                        : 'border-black/10 dark:border-white/15 text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    {ESTIMATOR_LABEL[key]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Voting Type</span>
            <div className="flex gap-3 text-xs">
              {(['hard', 'soft'] as const).map((v) => (
                <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={voting === v} onChange={() => setVoting(v)} />
                  {v}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] p-2.5 text-xs">
            <div className="font-semibold mb-1">Classification Metrics</div>
            <div className="tabular-nums">
              Voting Classifier accuracy: <b>{ensembleAcc.toFixed(3)}</b>
            </div>
            <div className="mt-1 flex flex-col gap-0.5 text-[var(--text-secondary)] tabular-nums">
              {selected.map((k, i) => (
                <span key={k}>
                  Model {i + 1} ({ESTIMATOR_LABEL[k]}): <b className="text-[var(--text-primary)]">{fits[k]?.accuracy.toFixed(3)}</b>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <canvas
            ref={mainRef}
            width={CW}
            height={CH}
            className="w-full h-auto rounded-lg border border-black/10 dark:border-white/10"
          />
          <p className="mt-1.5 text-[11px] text-[var(--text-secondary)]">
            {voting === 'hard'
              ? 'Hard voting: each model casts one class vote, the region colour follows the majority.'
              : 'Soft voting: each model contributes a probability, the region colour follows the averaged probability.'}
          </p>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {selected.map((k) => (
              <div key={k} className="flex flex-col gap-1">
                <canvas
                  ref={(el) => {
                    smallRefs.current[k] = el;
                  }}
                  width={SCW}
                  height={SCH}
                  className="w-full h-auto rounded-md border border-black/10 dark:border-white/10"
                />
                <span className="text-[10px] text-center text-[var(--text-secondary)]">{ESTIMATOR_LABEL[k]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
