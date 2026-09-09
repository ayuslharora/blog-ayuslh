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
  grid: { x: number[]; y: number[] };
  sigmoid: number[][];
  step: number[][];
  points: { x: number[]; y: number[]; p: number[]; label: number[] };
};

const MOBILE_BREAKPOINT = 768;

export default function SigmoidProbabilitySurface3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showStep, setShowStep] = useState(false);
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
    fetch('/data/ch22-sigmoid-surface.json')
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

  const { x, y } = data.grid;

  const sigmoidSurface = {
    x,
    y,
    z: data.sigmoid,
    type: 'surface' as const,
    colorscale: [
      [0, '#4363d8'],
      [0.5, '#d9d9d9'],
      [1, '#3cb44b'],
    ] as const,
    opacity: 0.92,
    showscale: false,
    contours: { z: { show: true, start: 0.1, end: 0.9, size: 0.1, color: '#00000033' } },
    name: 'σ(W·X)',
  };

  const stepSurface = {
    x,
    y,
    z: data.step,
    type: 'surface' as const,
    colorscale: [
      [0, '#9ca3af'],
      [1, '#9ca3af'],
    ] as const,
    opacity: 0.25,
    showscale: false,
    name: 'step',
  };

  const pts = (cls: number, color: string) => ({
    x: data.points.x.filter((_, i) => data.points.label[i] === cls),
    y: data.points.y.filter((_, i) => data.points.label[i] === cls),
    z: data.points.p.filter((_, i) => data.points.label[i] === cls),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 3.5, color, opacity: 0.9 },
    name: cls === 1 ? 'placed' : 'not placed',
  });

  const traces = [
    sigmoidSurface,
    ...(showStep ? [stepSurface] : []),
    pts(1, '#3cb44b'),
    pts(0, '#4363d8'),
  ];

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={traces}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'CGPA (x₁)' } },
              yaxis: { title: { text: 'IQ (x₂)' } },
              zaxis: { title: { text: 'P(placed)' }, range: [-0.05, 1.05] },
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
      <div className="flex items-center justify-center gap-4 mt-3">
        <button
          type="button"
          onClick={() => setShowStep((s) => !s)}
          className="text-xs rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
        >
          {showStep ? 'Hide' : 'Show'} the step function
        </button>
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        Sigmoid bends the score <code>W·X</code> into a smooth ramp from 0 to 1 that reads as <code>P(placed)</code>. Its <code>0.5</code> level set is the decision boundary; the contour lines are equal-probability curves. The step function (toggle) replaces the whole ramp with a vertical cliff, every point flush to 0 or 1, which is why correctly classified points produce no update.
      </p>
    </div>
  );
}
