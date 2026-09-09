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
  loss: number[][];
  bias: number;
  min: { w1: number; w2: number; loss: number };
};

const MOBILE_BREAKPOINT = 768;

export default function LogLossSurface3d() {
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
    fetch('/data/ch23-logloss-surface.json')
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

  const surface = {
    x: data.w1,
    y: data.w2,
    z: data.loss,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    showscale: true,
    colorbar: { title: { text: 'log loss' }, thickness: 12, len: 0.6 },
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
  };

  const minPoint = {
    x: [data.min.w1],
    y: [data.min.w2],
    z: [data.min.loss],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 5, color: '#e6194b', symbol: 'diamond' as const },
    name: 'minimum',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface, minPoint]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'w₁' } },
              yaxis: { title: { text: 'w₂' } },
              zaxis: { title: { text: 'log loss' } },
              camera: { eye: { x: 2.0, y: -2.0, z: 0.9 } },
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
        Average binary cross-entropy over the weights <code>w₁</code> and <code>w₂</code> (bias held at {data.bias.toFixed(1)}) on the same 100-point dataset. Log loss is convex, so it is one smooth bowl with a single minimum (red marker). There is no formula that jumps straight to that point; gradient descent, in the next chapter, walks down to it.
      </p>
    </div>
  );
}
