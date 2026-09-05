'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DecisionTree } from '../lib/decisionTree';
import {
  BaggingEnsemble,
  makeDataset,
  type BaggingConfig,
  type Bounds,
  type DatasetName,
  type Point,
} from '../lib/baggingModels';

const DATASETS: { key: DatasetName; label: string }[] = [
  { key: 'two-moons', label: 'Two Moons (noisy)' },
  { key: 'concentric', label: 'Concentric Circles' },
  { key: 'xor', label: 'XOR' },
  { key: 'u-shaped', label: 'U-Shaped' },
];

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
  bounds: Bounds,
  probaAt: (x: number, y: number) => number,
  X: Point[],
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

const FULL_PARAMS = {
  task: 'classification' as const,
  criterion: 'gini' as const,
  splitter: 'best' as const,
  maxDepth: 0,
  minSamplesSplit: 2,
  minSamplesLeaf: 1,
  maxLeafNodes: 0,
  minImpurityDecrease: 0,
  randomState: 42,
};

export default function BaggingIntuitionExplorer() {
  const [datasetName, setDatasetName] = useState<DatasetName>('two-moons');
  const [nEstimators, setNEstimators] = useState(50);
  const [maxSamples, setMaxSamples] = useState(0.5);
  const [bootstrapRows, setBootstrapRows] = useState(true);
  const [singleFeature, setSingleFeature] = useState(false);

  const mainRef = useRef<HTMLCanvasElement | null>(null);
  const smallRefs = useRef<Array<HTMLCanvasElement | null>>([]);

  const dataset = useMemo(() => makeDataset(datasetName), [datasetName]);

  const singleTree = useMemo(() => {
    const t = new DecisionTree(dataset.Xtr as number[][], dataset.ytr, FULL_PARAMS);
    return {
      trainAcc: t.accuracy(dataset.Xtr as number[][], dataset.ytr),
      testAcc: t.accuracy(dataset.Xte as number[][], dataset.yte),
      predict: (x: Point) => t.predict(x),
    };
  }, [dataset]);

  const ensemble = useMemo(() => {
    const cfg: BaggingConfig = {
      nEstimators,
      maxSamples,
      bootstrapRows,
      singleFeature,
      maxDepth: 0,
      seed: 12,
    };
    return new BaggingEnsemble(dataset.Xtr, dataset.ytr, cfg);
  }, [dataset, nEstimators, maxSamples, bootstrapRows, singleFeature]);

  const metrics = useMemo(
    () => ({
      trainAcc: ensemble.accuracy(dataset.Xtr, dataset.ytr),
      testAcc: ensemble.accuracy(dataset.Xte, dataset.yte),
    }),
    [ensemble, dataset]
  );

  useEffect(() => {
    const canvas = mainRef.current;
    if (!canvas) return;
    paintBoundary(
      canvas,
      CW,
      CH,
      GRID_NX,
      GRID_NY,
      dataset.bounds,
      (x, yv) => ensemble.proba([x, yv]),
      dataset.Xtr,
      dataset.ytr,
      3.2
    );
  }, [ensemble, dataset]);

  useEffect(() => {
    for (let i = 0; i < 3; i++) {
      const canvas = smallRefs.current[i];
      if (!canvas || i >= ensemble.bases.length) continue;
      const p = ensemble.baseProba(i);
      paintBoundary(
        canvas,
        SCW,
        SCH,
        SGRID_NX,
        SGRID_NY,
        dataset.bounds,
        (x, yv) => p([x, yv]),
        dataset.Xtr,
        dataset.ytr,
        1.8
      );
    }
  }, [ensemble, dataset]);

  const variant = singleFeature
    ? bootstrapRows
      ? 'Random Patches'
      : 'Random Subspaces'
    : bootstrapRows
      ? 'Bagging'
      : 'Pasting';

  return (
    <div className="not-prose my-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-60 shrink-0 flex flex-col gap-3">
          <div className="text-sm font-bold">Bagging Explorer</div>

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
            <span className="text-[11px] font-medium text-[var(--text-secondary)] tabular-nums">
              n_estimators: {nEstimators}
            </span>
            <input
              type="range"
              min={1}
              max={120}
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
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Row sampling</span>
            <div className="flex gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={bootstrapRows} onChange={() => setBootstrapRows(true)} />
                with replacement
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={!bootstrapRows} onChange={() => setBootstrapRows(false)} />
                without
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Features per tree</span>
            <div className="flex gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={!singleFeature} onChange={() => setSingleFeature(false)} />
                both
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={singleFeature} onChange={() => setSingleFeature(true)} />
                1 random
              </label>
            </div>
          </div>

          <div className="mt-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] p-2.5 text-xs">
            <div className="font-semibold mb-1">
              Variant: <span className="text-[#2563eb]">{variant}</span>
            </div>
            <div className="tabular-nums flex flex-col gap-0.5">
              <span>
                Ensemble test acc: <b>{metrics.testAcc.toFixed(3)}</b>
              </span>
              <span className="text-[var(--text-secondary)]">
                Ensemble train acc: <b className="text-[var(--text-primary)]">{metrics.trainAcc.toFixed(3)}</b>
              </span>
              <span className="mt-1 text-[var(--text-secondary)]">
                Single fully-grown tree:
              </span>
              <span className="text-[var(--text-secondary)]">
                test <b className="text-[var(--text-primary)]">{singleTree.testAcc.toFixed(3)}</b> / train{' '}
                <b className="text-[var(--text-primary)]">{singleTree.trainAcc.toFixed(3)}</b>
              </span>
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
            Aggregated boundary: region colour follows the majority hard vote of all {nEstimators} base
            trees. Points shown are the training set.
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-1">
                <canvas
                  ref={(el) => {
                    smallRefs.current[i] = el;
                  }}
                  width={SCW}
                  height={SCH}
                  className="w-full h-auto rounded-md border border-black/10 dark:border-white/10"
                />
                <span className="text-[10px] text-center text-[var(--text-secondary)] tabular-nums">
                  {i < ensemble.bases.length
                    ? `Tree ${i + 1} · test ${ensemble
                        .baseAccuracy(i, dataset.Xte, dataset.yte)
                        .toFixed(2)}`
                    : '-'}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--text-secondary)]">
            Each small panel is one base tree fit on its own random subset. Individually jagged and
            disagreeing; the vote above is smoother than any of them.
          </p>
        </div>
      </div>
    </div>
  );
}
