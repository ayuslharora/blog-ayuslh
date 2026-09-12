'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(
  () =>
    Promise.all([import('react-plotly.js/factory'), import('plotly.js-dist-min')]).then(
      ([{ default: createPlotlyComponent }, { default: Plotly }]) => createPlotlyComponent(Plotly)
    ),
  { ssr: false }
);

type Surf = { z: number[][]; point_z: number[]; slack: number[]; margin: number; n_slack: number };
type Data = {
  x: number[];
  y: number[];
  points: { x: number[]; y: number[]; label: number[] };
  surfaces: Record<string, Surf>;
};

const MOBILE_BREAKPOINT = 768;
const C_VALUES = ['0.05', '20'];

export default function SvmSlackSurface3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [cValue, setCValue] = useState('0.05');
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    fetch('/data/ch34-slack-surface.json')
      .then((res) => res.json())
      .then(setData);
  }, [isDesktop]);

  if (isDesktop === null) {
    return <div className="h-32 w-full my-8" />;
  }

  if (!isDesktop) {
    return (
      <div className="not-prose my-8 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] p-6 text-center text-sm text-[var(--text-secondary)]">
        This 3D visualization is disabled on smaller screens to keep the page fast. Move to a bigger screen (tablet or desktop) to see it.
      </div>
    );
  }

  if (!data) {
    return <div className="animate-pulse h-[460px] w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8" />;
  }

  const surf = data.surfaces[cValue];
  const flat = (level: number, color: string, op: number) => ({
    x: data.x,
    y: data.y,
    z: surf.z.map((row) => row.map(() => level)),
    type: 'surface' as const,
    colorscale: [
      [0, color],
      [1, color],
    ] as const,
    opacity: op,
    showscale: false,
  });

  const score = {
    x: data.x,
    y: data.y,
    z: surf.z,
    type: 'surface' as const,
    colorscale: [
      [0, '#e6194b'],
      [0.5, '#d9d9d9'],
      [1, '#3cb44b'],
    ] as const,
    cmid: 0,
    opacity: 0.85,
    showscale: false,
  };

  const cls = (c: number) => ({
    x: data.points.x.filter((_, i) => data.points.label[i] === c),
    y: data.points.y.filter((_, i) => data.points.label[i] === c),
    z: data.points.x.map((_, i) => i).filter((i) => data.points.label[i] === c).map((i) => surf.point_z[i]),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: {
      size: data.points.x.map((_, i) => i).filter((i) => data.points.label[i] === c).map((i) => 3 + surf.slack[i] * 2.2),
      color: c === 1 ? '#3cb44b' : '#e6194b',
      opacity: 0.85,
    },
    name: c === 1 ? 'class 1' : 'class 0',
  });

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[flat(0, '#9ca3af', 0.12), flat(1, '#3cb44b', 0.1), flat(-1, '#e6194b', 0.1), score, cls(1), cls(0)]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'x₁' } },
              yaxis: { title: { text: 'x₂' } },
              zaxis: { title: { text: 'score  w·x + b' } },
              camera: { eye: { x: 2.0, y: -2.0, z: 0.8 } },
              aspectratio: { x: 1.3, y: 1.3, z: 0.7 },
            },
            showlegend: false,
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: isDark ? '#e5e5e5' : '#171717' },
          }}
          config={{ responsive: true, displaylogo: false }}
          style={{ width: '100%' }}
          useResizeHandler
        />
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        {C_VALUES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCValue(c)}
            className={`text-xs rounded-full border px-3 py-1 transition-colors ${
              cValue === c
                ? 'border-transparent bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'border-black/10 dark:border-white/15 text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
            }`}
          >
            C = {c}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        Marker size is each point&apos;s slack <code>ξᵢ = max(0, 1 − yᵢ·score)</code>: points that clear their margin sheet shrink to a dot, points inside the margin or on the wrong side swell in proportion to how far they poke through it. At <code>C = {cValue}</code> the margin is {surf.margin.toFixed(2)} wide with {surf.n_slack} points carrying slack.
      </p>
    </div>
  );
}
