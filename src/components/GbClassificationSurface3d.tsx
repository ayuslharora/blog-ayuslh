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
  surfaces: number[][][];
  points: { x: number[]; y: number[]; label: number[] };
};

const MOBILE_BREAKPOINT = 768;

export default function GbClassificationSurface3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [stage, setStage] = useState(0);
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
    fetch('/data/ch61-gb-classification-surface.json')
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

  const { x, y } = data.grid;
  const maxStage = data.surfaces.length - 1;
  const z = data.surfaces[stage];

  const surface = {
    x,
    y,
    z,
    type: 'surface' as const,
    colorscale: [
      [0, '#dc2626'],
      [0.5, '#d9d9d9'],
      [1, '#2563eb'],
    ] as const,
    cmid: 0.5,
    opacity: 0.85,
    showscale: false,
    contours: { z: { show: true, start: 0.1, end: 0.9, size: 0.1, color: '#00000022' } },
    name: 'P(class 1)',
  };

  const pts = (cls: number, color: string) => ({
    x: data.points.x.filter((_, i) => data.points.label[i] === cls),
    y: data.points.y.filter((_, i) => data.points.label[i] === cls),
    z: data.points.label.filter((v) => v === cls),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 3, color, opacity: 0.9 },
    name: cls === 1 ? 'class 1' : 'class 0',
  });

  const stageLabel = stage === 0 ? 'Stage 0 (log-odds baseline)' : `After ${stage} tree${stage === 1 ? '' : 's'}`;

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface, pts(0, '#dc2626'), pts(1, '#2563eb')]}
          layout={{
            autosize: true,
            height: 480,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'X₁' } },
              yaxis: { title: { text: 'X₂' } },
              zaxis: { title: { text: 'class / P(class 1)' }, range: [-0.05, 1.05] },
              camera: { eye: { x: 1.9, y: -1.9, z: 0.9 } },
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
      <div className="flex flex-col items-center gap-1 mt-3 px-4">
        <div className="flex justify-between w-full max-w-sm text-[11px] font-medium text-[var(--text-secondary)]">
          <span>Stage</span>
          <span className="tabular-nums text-[var(--text-primary)]">{stageLabel}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxStage}
          step={1}
          value={stage}
          onChange={(e) => setStage(Number(e.target.value))}
          className="w-full max-w-sm"
        />
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        Red points sit at <code>z=0</code>, blue points at <code>z=1</code>, the surface is the model&apos;s predicted probability at every <code>(X₁, X₂)</code>. Drag the slider: stage 0 is a flat plane (the constant log-odds baseline), and each added regression tree bends the surface further toward the true class of every point.
      </p>
    </div>
  );
}
