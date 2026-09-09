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

type Data = {
  w0: number[];
  w1: number[];
  loss: number[][];
  w2_fixed: number;
  path: { w0: number[]; w1: number[]; loss: number[] };
  final: { w0: number; w1: number; loss: number };
};

const MOBILE_BREAKPOINT = 768;

export default function GdLogLossDescent3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
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
    fetch('/data/ch24-gd-path-surface.json')
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

  const lift = 0.04;

  const surface = {
    x: data.w0,
    y: data.w1,
    z: data.loss,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    opacity: 0.85,
    showscale: false,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
  };

  const pathLine = {
    x: data.path.w0,
    y: data.path.w1,
    z: data.path.loss.map((v) => v + lift),
    mode: 'lines+markers' as const,
    type: 'scatter3d' as const,
    line: { color: '#e6194b', width: 4 },
    marker: { size: 2, color: '#e6194b' },
    name: 'gradient descent path',
  };

  const startEnd = {
    x: [data.path.w0[0], data.final.w0],
    y: [data.path.w1[0], data.final.w1],
    z: [data.path.loss[0] + lift, data.final.loss + lift],
    mode: 'markers+text' as const,
    type: 'scatter3d' as const,
    text: ['start (1, 1)', 'minimum'],
    textposition: 'top center' as const,
    marker: { size: 5, color: ['#4363d8', '#e6194b'], symbol: 'diamond' as const },
    name: '',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface, pathLine, startEnd]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'w₀ (bias)' } },
              yaxis: { title: { text: 'w₁' } },
              zaxis: { title: { text: 'log loss' } },
              camera: { eye: { x: 2.1, y: -2.0, z: 0.9 } },
              aspectratio: { x: 1.3, y: 1.3, z: 0.8 },
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
      <p className="text-center text-xs text-[var(--text-secondary)] mt-3">
        The <code>gd()</code> loop above, plotted on the log-loss surface over <code>w₀</code> and <code>w₁</code> (with <code>w₂</code> held at its converged value {data.w2_fixed.toFixed(2)}). Starting from all-ones, each step moves against the gradient; the moves are large where the surface is steep and shrink to almost nothing as the path settles into the minimum after 5000 epochs.
      </p>
    </div>
  );
}
