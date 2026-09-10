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

type Surf = { prob: number[][]; coef_norm: number };
type Data = {
  x: number[];
  y: number[];
  surfaces: Record<string, Surf>;
  points: { x: number[]; y: number[]; label: number[] };
};

const MOBILE_BREAKPOINT = 768;
const C_VALUES = ['0.01', '1.0', '100.0'];

export default function CProbabilitySurface3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [cValue, setCValue] = useState('1.0');
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
    fetch('/data/ch30-c-probability-surface.json')
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

  const surface = {
    x: data.x,
    y: data.y,
    z: surf.prob,
    type: 'surface' as const,
    colorscale: [
      [0, '#4363d8'],
      [0.5, '#d9d9d9'],
      [1, '#e6194b'],
    ] as const,
    cmid: 0.5,
    opacity: 0.92,
    showscale: false,
    contours: { z: { show: true, start: 0.1, end: 0.9, size: 0.1, color: '#00000022' } },
  };

  const pts = (cls: number, color: string) => ({
    x: data.points.x.filter((_, i) => data.points.label[i] === cls),
    y: data.points.y.filter((_, i) => data.points.label[i] === cls),
    z: data.points.x.filter((_, i) => data.points.label[i] === cls).map(() => 0),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 3.5, color },
    name: `class ${cls}`,
  });

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface, pts(0, '#4363d8'), pts(1, '#e6194b')]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'x₁' } },
              yaxis: { title: { text: 'x₂' } },
              zaxis: { title: { text: 'P(class 1)' }, range: [-0.05, 1.05] },
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
        Predicted probability ramp at three regularization strengths, same data as the chart above. At <code>C = {cValue}</code> the weight vector has norm {surf.coef_norm.toFixed(2)}: small <code>C</code> shrinks the weights so the ramp is gentle and the model stays cautious even far from the boundary; large <code>C</code> lets the weights grow and the ramp steepens toward a hard step.
      </p>
    </div>
  );
}
