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

type PlaneData = {
  points: { x: number[]; y: number[]; z: number[] };
  plane: { x: number[]; y: number[]; z: number[][] };
};

const MOBILE_BREAKPOINT = 768;

export default function MultiRegPlane3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<PlaneData | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    fetch('/data/ch3-multiple-regression-plane.json')
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

  const scatter = {
    x: data.points.x,
    y: data.points.y,
    z: data.points.z,
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: 'students',
    marker: { size: 4, color: '#4363d8', opacity: 0.85 },
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
    opacity: 0.6,
    showscale: false,
    name: 'fitted plane',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[scatter, plane]}
          layout={{
            autosize: true,
            height: 550,
            margin: { l: 0, r: 0, t: 30, b: 0 },
            scene: {
              xaxis: { title: { text: 'cgpa' } },
              yaxis: { title: { text: 'iq' } },
              zaxis: { title: { text: 'package' } },
              camera: { eye: { x: 1.9, y: -0.6, z: 0.5 } },
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
