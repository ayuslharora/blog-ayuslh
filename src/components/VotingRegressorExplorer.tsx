'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  REG_ESTIMATOR_LABEL,
  fitRegEstimator,
  makeDataset1D,
  votingPredict,
  votingR2,
  type DatasetName1D,
  type FittedReg,
  type RegEstimatorKey,
} from '../lib/votingRegModels';

const DATASETS: { key: DatasetName1D; label: string }[] = [
  { key: 'linear-noisy', label: 'Linear (Noisy)' },
  { key: 'sine-wave', label: 'Sine Wave' },
  { key: 'step', label: 'Step' },
  { key: 'outlier', label: 'Outlier' },
];

const ESTIMATOR_KEYS: RegEstimatorKey[] = ['lr', 'svr', 'tree'];
const CURVE_COLOR: Record<RegEstimatorKey, string> = {
  lr: '#16a34a',
  svr: '#dc2626',
  tree: '#9333ea',
};

const CW = 640;
const CH = 340;
const PAD = 28;
const N_CURVE = 160;

export default function VotingRegressorExplorer() {
  const [datasetName, setDatasetName] = useState<DatasetName1D>('linear-noisy');
  const [selected, setSelected] = useState<RegEstimatorKey[]>(['lr', 'svr', 'tree']);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dataset = useMemo(() => makeDataset1D(datasetName), [datasetName]);

  const fits = useMemo(() => {
    const out: Record<RegEstimatorKey, FittedReg> = {} as Record<RegEstimatorKey, FittedReg>;
    for (const key of selected) out[key] = fitRegEstimator(key, dataset.X, dataset.y);
    return out;
  }, [dataset, selected]);

  const ensembleR2 = useMemo(() => {
    if (selected.length === 0) return 0;
    return votingR2(selected.map((k) => fits[k]), dataset.X, dataset.y);
  }, [fits, selected, dataset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || selected.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { X, y, xmin, xmax } = dataset;
    const ymin = Math.min(...y) - 1.5;
    const ymax = Math.max(...y) + 1.5;
    const sx = (x: number) => PAD + ((x - xmin) / (xmax - xmin)) * (CW - 2 * PAD);
    const sy = (yy: number) => CH - PAD - ((yy - ymin) / (ymax - ymin)) * (CH - 2 * PAD);

    ctx.clearRect(0, 0, CW, CH);
    ctx.strokeStyle = 'rgba(120,120,120,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, PAD, CW - 2 * PAD, CH - 2 * PAD);

    // scatter points
    for (let i = 0; i < X.length; i++) {
      ctx.beginPath();
      ctx.arc(sx(X[i]), sy(y[i]), 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(37,99,235,0.55)';
      ctx.fill();
    }

    const list = selected.map((k) => fits[k]);

    // individual model curves
    for (const key of selected) {
      const f = fits[key];
      ctx.beginPath();
      for (let i = 0; i <= N_CURVE; i++) {
        const x = xmin + ((xmax - xmin) * i) / N_CURVE;
        const yy = f.predict(x);
        const px = sx(x);
        const py = sy(yy);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = CURVE_COLOR[key];
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ensemble (voting regressor) curve
    ctx.beginPath();
    for (let i = 0; i <= N_CURVE; i++) {
      const x = xmin + ((xmax - xmin) * i) / N_CURVE;
      const yy = votingPredict(list, x);
      const px = sx(x);
      const py = sy(yy);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.6;
    ctx.stroke();
  }, [fits, selected, dataset]);

  const toggleEstimator = (key: RegEstimatorKey) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.length > 1 ? prev.filter((k) => k !== key) : prev;
      return [...prev, key];
    });
  };

  return (
    <div className="not-prose my-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0 flex flex-col gap-3">
          <div className="text-sm font-bold">Voting Regressor</div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Dataset</span>
            <select
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value as DatasetName1D)}
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
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Base estimators</span>
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
                        ? 'text-white'
                        : 'border-black/10 dark:border-white/15 text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    style={on ? { backgroundColor: CURVE_COLOR[key], borderColor: CURVE_COLOR[key] } : undefined}
                  >
                    {REG_ESTIMATOR_LABEL[key]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] p-2.5 text-xs">
            <div className="font-semibold mb-1">R² score</div>
            <div className="tabular-nums">
              Voting Regressor: <b style={{ color: '#2563eb' }}>{ensembleR2.toFixed(3)}</b>
            </div>
            <div className="mt-1 flex flex-col gap-0.5 text-[var(--text-secondary)] tabular-nums">
              {selected.map((k) => (
                <span key={k}>
                  {REG_ESTIMATOR_LABEL[k]}:{' '}
                  <b className="text-[var(--text-primary)]">{fits[k]?.r2.toFixed(3)}</b>
                </span>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Dashed lines are each base model on its own; the solid blue line is their averaged prediction, the
            voting regressor.
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="w-full h-auto rounded-lg border border-black/10 dark:border-white/10"
          />
        </div>
      </div>
    </div>
  );
}
