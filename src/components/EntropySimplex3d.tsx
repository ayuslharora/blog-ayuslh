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

type Data = { p1: number[]; p2: number[]; entropy: (number | null)[][]; gini: (number | null)[][] };

const MOBILE_BREAKPOINT = 768;

export default function EntropySimplex3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [measure, setMeasure] = useState<'entropy' | 'gini'>('entropy');
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
    fetch('/data/ch38-entropy-simplex.json')
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

  const z = measure === 'entropy' ? data.entropy : data.gini;
  const peak = measure === 'entropy' ? Math.log2(3) : 2 / 3;

  const surface = {
    x: data.p1,
    y: data.p2,
    z,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    showscale: false,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
    connectgaps: false,
  };

  const corners = {
    x: [0.001, 0.999, 0.001],
    y: [0.001, 0.001, 0.999],
    z: [0, 0, 0],
    mode: 'markers+text' as const,
    type: 'scatter3d' as const,
    text: ['pure class 3', 'pure class 1', 'pure class 2'],
    textposition: 'top center' as const,
    marker: { size: 3, color: '#e6194b' },
    name: '',
  };

  const uniform = {
    x: [1 / 3],
    y: [1 / 3],
    z: [peak],
    mode: 'markers+text' as const,
    type: 'scatter3d' as const,
    text: ['uniform (max)'],
    textposition: 'top center' as const,
    marker: { size: 4, color: '#e6194b', symbol: 'diamond' as const },
    name: '',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface, corners, uniform]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'p₁' } },
              yaxis: { title: { text: 'p₂' } },
              zaxis: { title: { text: measure === 'entropy' ? 'H(p)' : 'Gini(p)' } },
              camera: { eye: { x: 1.9, y: -1.9, z: 1.0 } },
              aspectratio: { x: 1.2, y: 1.2, z: 0.8 },
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
        {(['entropy', 'gini'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMeasure(m)}
            className={`text-xs rounded-full border px-3 py-1 capitalize transition-colors ${
              measure === m
                ? 'border-transparent bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'border-black/10 dark:border-white/15 text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        The 2-class curve above, generalized to three classes. <code>p₃ = 1 − p₁ − p₂</code>, so the triangle is every valid 3-class probability split. Each corner is a pure node (one class at 100%, {measure} = 0); the center, all three classes equally likely, is the peak, {peak.toFixed(3)} for {measure}. The bowl-shaped (inverted) surface is exactly why a split that pushes a node toward a corner is rewarded.
      </p>
    </div>
  );
}
