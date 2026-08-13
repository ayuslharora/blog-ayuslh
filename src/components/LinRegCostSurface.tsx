'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Plotly's bundle is ~3MB; dynamic-import with ssr:false so it's only ever
// fetched on desktop, after the viewport check below decides to render it.
// plotly.js-dist-min (not the full plotly.js) keeps that bundle smaller by
// dropping unused chart types, wired up via react-plotly.js's factory API.
const Plot = dynamic(
  () =>
    Promise.all([import('react-plotly.js/factory'), import('plotly.js-dist-min')]).then(
      ([{ default: createPlotlyComponent }, { default: Plotly }]) => createPlotlyComponent(Plotly)
    ),
  { ssr: false }
);

type CostSurface = {
  m: number[];
  b: number[];
  cost: number[][];
  mStar: number;
  bStar: number;
  costStar: number;
};

const MOBILE_BREAKPOINT = 768;

export default function LinRegCostSurface() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<CostSurface | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    fetch('/data/ch2-cost-surface.json')
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
    return <div className="animate-pulse h-[500px] w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8" />;
  }

  const surface = {
    x: data.m,
    y: data.b,
    z: data.cost,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    opacity: 0.92,
    showscale: false,
    contours: {
      z: { show: true, usecolormap: true, highlightcolor: '#f58231', project: { z: true } },
    },
  };

  const minPoint = {
    x: [data.mStar],
    y: [data.bStar],
    z: [data.costStar + 0.02],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: 'OLS minimum',
    marker: { size: 5, color: '#e6194b' },
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface, minPoint]}
          layout={{
            autosize: true,
            height: 550,
            margin: { l: 0, r: 0, t: 30, b: 0 },
            scene: {
              xaxis: { title: { text: 'm (slope)' } },
              yaxis: { title: { text: 'b (intercept)' } },
              zaxis: { title: { text: 'MSE' } },
              camera: { eye: { x: 1.6, y: -1.6, z: 0.9 } },
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
    </div>
  );
}
