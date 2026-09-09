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

type SurfaceData = {
  alpha: number[];
  l1_ratio: number[];
  r2: number[][];
  best: { alpha: number; l1_ratio: number; r2: number };
};

const MOBILE_BREAKPOINT = 768;

export default function ElasticNetR2Surface3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<SurfaceData | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    fetch('/data/ch19-elasticnet-r2-surface.json')
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
    return <div className="animate-pulse h-[480px] w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8" />;
  }

  const logAlpha = data.alpha.map((a) => Math.log10(a));

  const surface = {
    x: logAlpha,
    y: data.l1_ratio,
    z: data.r2,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    showscale: true,
    colorbar: { title: { text: 'test R²' }, thickness: 12, len: 0.6 },
    contours: {
      z: { show: true, usecolormap: true, project: { z: true } },
    },
  };

  const peak = {
    x: [Math.log10(data.best.alpha)],
    y: [data.best.l1_ratio],
    z: [data.best.r2],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 5, color: '#e6194b', symbol: 'diamond' as const },
    name: 'best R²',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface, peak]}
          layout={{
            autosize: true,
            height: 440,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'log₁₀(alpha)' } },
              yaxis: { title: { text: 'l1_ratio' } },
              zaxis: { title: { text: 'test R²' } },
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
        Test R² of <code>ElasticNet</code> across the full <code>(alpha, l1_ratio)</code> grid on the diabetes dataset. Ridge and Lasso each search only a single edge of this surface (<code>l1_ratio = 0</code> and <code>l1_ratio = 1</code>); Elastic Net searches the whole sheet. The red marker is the grid maximum, R² ≈ {data.best.r2.toFixed(3)}.
      </p>
    </div>
  );
}
