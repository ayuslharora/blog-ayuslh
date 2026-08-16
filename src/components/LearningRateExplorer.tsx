'use client';

import { useEffect, useMemo, useState } from 'react';

type GdData = {
  x: number[];
  y: number[];
  mStar: number;
  bStar: number;
};

const WIDTH = 560;
const HEIGHT = 360;
const PAD_L = 64;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 40;

const B_START = -120;
// dL/db = -2 * sum(y - m*x - b) is linear in b, so this 1D slice is an exact
// parabola: the update b_{k+1} = b_k(1 - 2*lr*n) + 2*lr*S converges iff
// |1 - 2*lr*n| < 1, i.e. lr < 1/n. With n=100 that critical rate is 0.01.
const LR_MIN = 0.0001;
const LR_MAX = 0.015;
const LR_DEFAULT = 0.004;

export default function LearningRateExplorer() {
  const [data, setData] = useState<GdData | null>(null);
  const [lr, setLr] = useState(LR_DEFAULT);
  const [history, setHistory] = useState<{ b: number; loss: number }[]>([]);

  useEffect(() => {
    fetch('/data/ch7-gradient-descent.json')
      .then((res) => res.json())
      .then((d: GdData) => {
        setData(d);
      });
  }, []);

  const lossAt = useMemo(() => {
    if (!data) return null;
    const { x, y, mStar } = data;
    return (b: number) => x.reduce((acc, xi, i) => acc + (y[i] - mStar * xi - b) ** 2, 0);
  }, [data]);

  const gradAt = useMemo(() => {
    if (!data) return null;
    const { x, y, mStar } = data;
    return (b: number) => -2 * x.reduce((acc, xi, i) => acc + (y[i] - mStar * xi - b), 0);
  }, [data]);

  useEffect(() => {
    if (!lossAt) return;
    setHistory([{ b: B_START, loss: lossAt(B_START) }]);
  }, [lossAt]);

  if (!data || !lossAt || !gradAt || history.length === 0) {
    return <div className="animate-pulse h-[440px] w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8" />;
  }

  const current = history[history.length - 1];
  const step = history.length - 1;

  const doStep = () => {
    const grad = gradAt(current.b);
    const newB = current.b - lr * grad;
    setHistory((h) => [...h, { b: newB, loss: lossAt(newB) }]);
  };

  const doReset = () => {
    setHistory([{ b: B_START, loss: lossAt(B_START) }]);
  };

  // Diverging once the step multiplier |1 - 2*lr*n| exceeds 1, i.e. lr > 1/n.
  const diverging = lr >= 1 / data.x.length;
  const stuckWarning = diverging && step >= 3;

  const visitedBs = history.map((h) => h.b);
  const bSpread = Math.max(...visitedBs.map((b) => Math.abs(b - data.bStar)), 60);
  const bMin = data.bStar - bSpread * 1.15;
  const bMax = data.bStar + bSpread * 1.15;

  const curveSamples = 80;
  const curve = Array.from({ length: curveSamples }, (_, i) => {
    const b = bMin + ((bMax - bMin) * i) / (curveSamples - 1);
    return { b, loss: lossAt(b) };
  });
  const lossMax = Math.max(...curve.map((p) => p.loss), ...history.map((h) => h.loss)) * 1.05;

  const sx = (b: number) => PAD_L + ((b - bMin) / (bMax - bMin)) * (WIDTH - PAD_L - PAD_R);
  const sy = (l: number) => HEIGHT - PAD_B - (l / lossMax) * (HEIGHT - PAD_T - PAD_B);

  return (
    <div className="not-prose my-8 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-4 sm:p-6">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium w-32 shrink-0">Learning rate</label>
          <input
            type="range"
            min={LR_MIN}
            max={LR_MAX}
            step={0.0001}
            value={lr}
            onChange={(e) => setLr(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm tabular-nums w-16 text-right">{lr.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={doStep}
            className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Step
          </button>
          <button
            onClick={doReset}
            className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Reset
          </button>
          <span className="text-xs text-[var(--text-secondary)] tabular-nums">
            step {step} · b={current.b.toFixed(2)} · loss={Math.round(current.loss).toLocaleString()}
          </span>
        </div>
        {stuckWarning && (
          <div className="text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            Gradient descent will never reach the minimum loss at this learning rate. Try again with a smaller one (below {(1 / data.x.length).toFixed(3)}).
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto text-[var(--text-secondary)]">
        <text x={12} y={PAD_T - 6} className="fill-current text-[10px]">
          Loss
        </text>
        <text x={WIDTH - 12} y={HEIGHT - 12} textAnchor="end" className="fill-current text-[10px]">
          intercept b
        </text>
        <line x1={sx(data.bStar)} y1={PAD_T} x2={sx(data.bStar)} y2={HEIGHT - PAD_B} stroke="currentColor" strokeOpacity={0.15} strokeDasharray="4 4" />
        <polyline
          points={curve.map((p) => `${sx(p.b)},${sy(Math.min(p.loss, lossMax))}`).join(' ')}
          fill="none"
          stroke="#4363d8"
          strokeWidth={2}
        />
        {history.slice(0, -1).map((h, i) => (
          <rect key={i} x={sx(h.b) - 3} y={sy(Math.min(h.loss, lossMax)) - 3} width={6} height={6} fill="#f58231" opacity={0.55} />
        ))}
        <circle cx={sx(data.bStar)} cy={sy(0)} r={4} fill="#e6194b" />
        <rect x={sx(current.b) - 4.5} y={sy(Math.min(current.loss, lossMax)) - 4.5} width={9} height={9} fill="#f58231" stroke="#171717" strokeWidth={0.5} />
      </svg>
    </div>
  );
}
