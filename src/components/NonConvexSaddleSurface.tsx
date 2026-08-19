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

type Point = { x: number; y: number; z: number };
type SurfaceData = {
  x: number[];
  y: number[];
  z: number[][];
  minima: Point[];
  saddle: Point;
  trajectories: { left: Point[]; right: Point[]; saddle: Point[] };
};

const MOBILE_BREAKPOINT = 768;

const TRAJ_COLORS: Record<'left' | 'right' | 'saddle', string> = {
  left: '#4363d8',
  right: '#3cb44b',
  saddle: '#e6194b',
};

const TRAJ_LABELS: Record<'left' | 'right' | 'saddle', string> = {
  left: 'Starts left of saddle',
  right: 'Starts right of saddle',
  saddle: 'Starts near saddle (plateaus)',
};

export default function NonConvexSaddleSurface() {
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
    fetch('/data/ch7-nonconvex-surface.json')
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
    return <div className="animate-pulse h-[550px] w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8" />;
  }

  const surface = {
    x: data.x,
    y: data.y,
    z: data.z,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    opacity: 0.85,
    showscale: false,
    contours: {
      z: { show: true, usecolormap: true, highlightcolor: '#f58231', project: { z: true } },
    },
  };

  const trajTraces = (Object.keys(data.trajectories) as Array<'left' | 'right' | 'saddle'>).map((key) => {
    const traj = data.trajectories[key];
    return {
      x: traj.map((p) => p.x),
      y: traj.map((p) => p.y),
      z: traj.map((p) => p.z + 0.05),
      mode: 'lines' as const,
      type: 'scatter3d' as const,
      name: TRAJ_LABELS[key],
      line: { color: TRAJ_COLORS[key], width: 4 },
    };
  });

  const minimaPoints = {
    x: data.minima.map((p) => p.x),
    y: data.minima.map((p) => p.y),
    z: data.minima.map((p) => p.z + 0.05),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: 'Global minima',
    marker: { size: 5, color: '#171717' },
  };

  const saddlePoint = {
    x: [data.saddle.x],
    y: [data.saddle.y],
    z: [data.saddle.z + 0.05],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: 'Saddle point',
    marker: { size: 6, color: '#f5c518', symbol: 'diamond' },
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface, ...trajTraces, minimaPoints, saddlePoint]}
          layout={{
            autosize: true,
            height: 550,
            margin: { l: 0, r: 0, t: 30, b: 0 },
            scene: {
              xaxis: { title: { text: 'x' } },
              yaxis: { title: { text: 'y' } },
              zaxis: { title: { text: 'f(x, y)' } },
              camera: { eye: { x: 1.7, y: -1.7, z: 1.1 } },
              aspectmode: 'manual',
              aspectratio: { x: 1.3, y: 1.3, z: 0.6 },
            },
            showlegend: true,
            legend: { x: 0, y: 1 },
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
