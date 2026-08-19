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

type Bowl = {
  title: string;
  lr: number;
  w1: number[];
  w2: number[];
  z: number[][];
  path: { w1: number[]; w2: number[]; z: number[] };
  start: { w1: number; w2: number; z: number };
  finalW2: number;
};

type FeatureScalingData = {
  unscaled: Bowl;
  scaled: Bowl;
  steps: number;
};

const MOBILE_BREAKPOINT = 768;

function BowlPlot({ bowl, steps, isDark }: { bowl: Bowl; steps: number; isDark: boolean }) {
  const surface = {
    x: bowl.w1,
    y: bowl.w2,
    z: bowl.z,
    type: 'surface' as const,
    colorscale: 'Blues' as const,
    reversescale: true,
    opacity: 0.75,
    showscale: false,
    contours: {
      z: { show: true, usecolormap: true, highlightcolor: '#f58231', project: { z: true } },
    },
  };

  const path = {
    x: bowl.path.w1,
    y: bowl.path.w2,
    z: bowl.path.z,
    mode: 'lines+markers' as const,
    type: 'scatter3d' as const,
    name: 'GD path',
    line: { color: '#e6194b', width: 4 },
    marker: { size: 2.5, color: '#e6194b' },
  };

  const start = {
    x: [bowl.start.w1],
    y: [bowl.start.w2],
    z: [bowl.start.z],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: 'Start',
    marker: { size: 5, color: '#4363d8' },
  };

  const minimum = {
    x: [0],
    y: [0],
    z: [0],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: 'Minimum',
    marker: { size: 6, color: 'black', symbol: 'diamond' },
  };

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
      <div className="px-4 pt-3 text-xs font-semibold text-[var(--text-secondary)]">
        {bowl.title} · lr={bowl.lr}, {steps} steps, final w2={bowl.finalW2.toFixed(3)}
      </div>
      <Plot
        data={[surface, path, start, minimum]}
        layout={{
          autosize: true,
          height: 480,
          margin: { l: 0, r: 0, t: 10, b: 0 },
          scene: {
            xaxis: { title: { text: 'w1' } },
            yaxis: { title: { text: 'w2' } },
            zaxis: { title: { text: 'Loss' } },
            camera: { eye: { x: 1.6, y: -1.6, z: 0.9 } },
          },
          showlegend: true,
          legend: { x: 0, y: 1 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: isDark ? '#e5e5e5' : '#171717', size: 10 },
        }}
        config={{ responsive: true, displaylogo: false }}
        style={{ width: '100%' }}
        useResizeHandler
      />
    </div>
  );
}

export default function FeatureScalingBowls3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<FeatureScalingData | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    fetch('/data/ch7-feature-scaling.json')
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

  return (
    <div className="not-prose my-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BowlPlot bowl={data.unscaled} steps={data.steps} isDark={isDark} />
      <BowlPlot bowl={data.scaled} steps={data.steps} isDark={isDark} />
    </div>
  );
}
