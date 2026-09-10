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
  w1: number[];
  w2: number[];
  objective: number[][];
  objective_feasible: (number | null)[][];
  optimum: { w1: number; w2: number; obj: number };
  b: number;
};

const MOBILE_BREAKPOINT = 768;

export default function SvmQpSurface3d() {
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
    fetch('/data/ch33-svm-qp-surface.json')
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

  const full = {
    x: data.w1,
    y: data.w2,
    z: data.objective,
    type: 'surface' as const,
    colorscale: [
      [0, '#d1d5db'],
      [1, '#d1d5db'],
    ] as const,
    opacity: 0.25,
    showscale: false,
    name: 'objective',
  };

  const feasible = {
    x: data.w1,
    y: data.w2,
    z: data.objective_feasible,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    opacity: 0.95,
    showscale: false,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
    name: 'feasible region',
  };

  const optimum = {
    x: [data.optimum.w1],
    y: [data.optimum.w2],
    z: [data.optimum.obj],
    mode: 'markers+text' as const,
    type: 'scatter3d' as const,
    text: ['SVM solution'],
    textposition: 'top center' as const,
    marker: { size: 5, color: '#e6194b', symbol: 'diamond' as const },
    name: '',
  };

  const origin = {
    x: [0],
    y: [0],
    z: [0],
    mode: 'markers+text' as const,
    type: 'scatter3d' as const,
    text: ['w = 0 (forbidden)'],
    textposition: 'bottom center' as const,
    marker: { size: 4, color: '#9ca3af', symbol: 'x' as const },
    name: '',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[full, feasible, optimum, origin]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'w₁' } },
              yaxis: { title: { text: 'w₂' } },
              zaxis: { title: { text: '½‖w‖²' } },
              camera: { eye: { x: 2.0, y: -2.0, z: 1.0 } },
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
      <p className="text-center text-xs text-[var(--text-secondary)] mt-3">
        The objective <code>½‖w‖²</code> over the weights (bias held at its fitted value). The grey bowl is the full paraboloid; only the coloured patch satisfies every <code>yᵢ(w·xᵢ + b) ≥ 1</code> constraint. The unconstrained minimum is <code>w = 0</code>, but that violates the constraints, so the solution is the lowest point of the coloured patch, sitting on its edge where a support-vector constraint is exactly tight.
      </p>
    </div>
  );
}
