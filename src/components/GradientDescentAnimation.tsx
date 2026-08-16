'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type GdData = {
  x: number[];
  y: number[];
  mStar: number;
  bStar: number;
  trace: { m: number; b: number; cost: number }[];
};

const WIDTH = 480;
const HEIGHT = 320;
const PAD = 36;

export default function GradientDescentAnimation() {
  const [data, setData] = useState<GdData | null>(null);
  const [epoch, setEpoch] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/data/ch7-gradient-descent.json')
      .then((res) => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (!playing || !data) return;
    timerRef.current = setInterval(() => {
      setEpoch((e) => {
        if (e >= data.trace.length - 1) {
          setPlaying(false);
          return e;
        }
        return e + 1;
      });
    }, 250);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, data]);

  const scales = useMemo(() => {
    if (!data) return null;
    const xMin = Math.min(...data.x);
    const xMax = Math.max(...data.x);
    const yMin = Math.min(...data.y);
    const yMax = Math.max(...data.y);
    const yPad = (yMax - yMin) * 0.1;
    const sx = (v: number) => PAD + ((v - xMin) / (xMax - xMin)) * (WIDTH - 2 * PAD);
    const sy = (v: number) =>
      HEIGHT - PAD - ((v - (yMin - yPad)) / (yMax - yPad - (yMin - yPad))) * (HEIGHT - 2 * PAD);
    return { xMin, xMax, sx, sy };
  }, [data]);

  const costScales = useMemo(() => {
    if (!data) return null;
    const costs = data.trace.map((t) => t.cost);
    const costMax = Math.max(...costs);
    const n = data.trace.length;
    const sx = (i: number) => PAD + (i / (n - 1)) * (WIDTH - 2 * PAD);
    const sy = (c: number) => HEIGHT - PAD - (c / costMax) * (HEIGHT - 2 * PAD);
    return { sx, sy };
  }, [data]);

  if (!data || !scales || !costScales) {
    return <div className="animate-pulse h-[380px] w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8" />;
  }

  const { m, b, cost } = data.trace[epoch];
  const linePoints = [scales.xMin, scales.xMax].map((xv) => ({ x: xv, y: m * xv + b }));

  return (
    <div className="not-prose my-8 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto text-[var(--text-secondary)]">
            <text x={WIDTH / 2} y={16} textAnchor="middle" className="fill-current text-xs font-medium">
              Fitted line vs data
            </text>
            {data.x.map((xv, i) => (
              <circle key={i} cx={scales.sx(xv)} cy={scales.sy(data.y[i])} r={2.5} className="fill-current opacity-40" />
            ))}
            <line
              x1={scales.sx(linePoints[0].x)}
              y1={scales.sy(linePoints[0].y)}
              x2={scales.sx(linePoints[1].x)}
              y2={scales.sy(linePoints[1].y)}
              stroke="#e6194b"
              strokeWidth={2}
            />
          </svg>
        </div>
        <div className="flex-1">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto text-[var(--text-secondary)]">
            <text x={WIDTH / 2} y={16} textAnchor="middle" className="fill-current text-xs font-medium">
              Cost vs epoch
            </text>
            <polyline
              points={data.trace
                .slice(0, epoch + 1)
                .map((t, i) => `${costScales.sx(i)},${costScales.sy(t.cost)}`)
                .join(' ')}
              fill="none"
              stroke="#4363d8"
              strokeWidth={2}
            />
            <circle cx={costScales.sx(epoch)} cy={costScales.sy(cost)} r={3.5} fill="#e6194b" />
          </svg>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={() => {
            if (epoch >= data.trace.length - 1) setEpoch(0);
            setPlaying((p) => !p);
          }}
          className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min={0}
          max={data.trace.length - 1}
          value={epoch}
          onChange={(e) => {
            setPlaying(false);
            setEpoch(Number(e.target.value));
          }}
          className="flex-1"
        />
        <span className="text-xs text-[var(--text-secondary)] tabular-nums whitespace-nowrap">
          epoch {epoch + 1}/{data.trace.length} · m={m.toFixed(2)} b={b.toFixed(2)} · cost={Math.round(cost).toLocaleString()}
        </span>
      </div>
      <div className="mt-1 text-xs text-[var(--text-secondary)]">
        OLS target: m={data.mStar.toFixed(2)}, b={data.bStar.toFixed(2)}
      </div>
    </div>
  );
}
