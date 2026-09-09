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
  p: number[];
  r: number[];
  f1: number[][];
  arithmetic: number[][];
  example: { p: number; r: number; f1: number; arith: number };
};

const MOBILE_BREAKPOINT = 768;

export default function F1HarmonicSurface3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showArith, setShowArith] = useState(true);
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
    fetch('/data/ch26-f1-surface.json')
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

  const f1Surface = {
    x: data.p,
    y: data.r,
    z: data.f1,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    showscale: false,
    opacity: 0.95,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
    name: 'F1 (harmonic mean)',
  };

  const arithSurface = {
    x: data.p,
    y: data.r,
    z: data.arithmetic,
    type: 'surface' as const,
    colorscale: [
      [0, '#9ca3af'],
      [1, '#9ca3af'],
    ] as const,
    opacity: 0.28,
    showscale: false,
    name: 'arithmetic mean',
  };

  const marker = {
    x: [data.example.p],
    y: [data.example.r],
    z: [data.example.f1],
    mode: 'markers+text' as const,
    type: 'scatter3d' as const,
    text: [`P 0.6, R 1.0 → F1 ${data.example.f1.toFixed(2)}`],
    textposition: 'top center' as const,
    marker: { size: 4, color: '#e6194b' },
    name: '',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={showArith ? [f1Surface, arithSurface, marker] : [f1Surface, marker]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'precision' } },
              yaxis: { title: { text: 'recall' } },
              zaxis: { title: { text: 'score' }, range: [0, 1] },
              camera: { eye: { x: 2.0, y: -2.0, z: 0.8 } },
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
      <div className="flex items-center justify-center gap-4 mt-3">
        <button
          type="button"
          onClick={() => setShowArith((s) => !s)}
          className="text-xs rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
        >
          {showArith ? 'Hide' : 'Show'} the arithmetic-mean plane
        </button>
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        F1 as a surface over precision and recall. Along the diagonal (precision = recall) it agrees with the flat arithmetic-mean plane, but everywhere else it sags toward the smaller of the two, pulling a lopsided model's score down. At P = 0.6, R = 1.0 the arithmetic mean is 0.80 while F1 is {data.example.f1.toFixed(2)}.
      </p>
    </div>
  );
}
