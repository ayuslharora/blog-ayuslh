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
  points: { x: number[]; y: number[]; z: number[] };
  plane: { x: number[]; y: number[]; z: number[][] };
  surface: { x: number[]; y: number[]; z: number[][] };
};

const MOBILE_BREAKPOINT = 768;

export default function PolyRegSurface3d() {
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
    fetch('/data/ch11-3d-linear-vs-polynomial.json')
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

  const scatter = {
    x: data.points.x,
    y: data.points.y,
    z: data.points.z,
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: 'data',
    marker: { size: 3, color: '#4363d8', opacity: 0.8 },
  };

  const plane = {
    x: data.plane.x,
    y: data.plane.y,
    z: data.plane.z,
    type: 'surface' as const,
    colorscale: [
      [0, '#f58231'],
      [1, '#f58231'],
    ] as const,
    opacity: 0.45,
    showscale: false,
    name: 'linear regression (plane)',
  };

  const surface = {
    x: data.surface.x,
    y: data.surface.y,
    z: data.surface.z,
    type: 'surface' as const,
    colorscale: [
      [0, '#3cb44b'],
      [1, '#3cb44b'],
    ] as const,
    opacity: 0.75,
    showscale: false,
    name: 'polynomial regression (degree 2)',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[scatter, plane, surface]}
          layout={{
            autosize: true,
            height: 550,
            margin: { l: 0, r: 0, t: 30, b: 0 },
            scene: {
              xaxis: { title: { text: 'x1' } },
              yaxis: { title: { text: 'x2' } },
              zaxis: { title: { text: 'z' } },
              camera: { eye: { x: 1.7, y: -1.7, z: 0.9 } },
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
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#f58231' }} />
          linear regression (plane)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#3cb44b' }} />
          polynomial regression, degree 2 (paraboloid)
        </span>
      </div>
    </div>
  );
}
