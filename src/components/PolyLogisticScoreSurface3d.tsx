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
  x: number[];
  y: number[];
  z: number[][];
  points: { x: number[]; y: number[]; z: number[]; label: number[] };
};

const MOBILE_BREAKPOINT = 768;
const CAP = 15;

export default function PolyLogisticScoreSurface3d() {
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
    fetch('/data/ch29-poly-score-surface.json')
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

  const zCapped = data.z.map((row) => row.map((v) => Math.max(-CAP, Math.min(CAP, v))));
  const zero = data.z.map((row) => row.map(() => 0));

  const scoreSurface = {
    x: data.x,
    y: data.y,
    z: zCapped,
    type: 'surface' as const,
    colorscale: [
      [0, '#4363d8'],
      [0.5, '#d9d9d9'],
      [1, '#f58231'],
    ] as const,
    cmid: 0,
    opacity: 0.9,
    showscale: false,
    contours: { z: { show: true, start: -CAP, end: CAP, size: 3, color: '#00000022' } },
  };

  const threshold = {
    x: data.x,
    y: data.y,
    z: zero,
    type: 'surface' as const,
    colorscale: [
      [0, '#9ca3af'],
      [1, '#9ca3af'],
    ] as const,
    opacity: 0.22,
    showscale: false,
  };

  const pts = (cls: number, color: string) => ({
    x: data.points.x.filter((_, i) => data.points.label[i] === cls),
    y: data.points.y.filter((_, i) => data.points.label[i] === cls),
    z: data.points.z.filter((_, i) => data.points.label[i] === cls),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 3.5, color, opacity: 0.9 },
    name: cls === 1 ? 'class 1' : 'class 0',
  });

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[threshold, scoreSurface, pts(0, '#4363d8'), pts(1, '#f58231')]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'x₁' } },
              yaxis: { title: { text: 'x₂' } },
              zaxis: { title: { text: 'score  wᵀφ(x)' }, range: [-CAP, CAP] },
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
      <p className="text-center text-xs text-[var(--text-secondary)] mt-3">
        The degree-3 model's raw score over the feature plane. In the expanded polynomial space this is still a flat cut, but written back in terms of <code>x₁</code> and <code>x₂</code> it is a curved surface. Its intersection with the grey <code>score = 0</code> sheet, seen from directly above, is the curved decision boundary in the 2D plot. Values are clipped at ±{CAP} so the region near the boundary stays readable.
      </p>
    </div>
  );
}
