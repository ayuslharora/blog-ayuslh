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
  weights: { w0: number; w1: number; w2: number };
  plane: { x: number[]; y: number[]; z: number[][] };
  points: { x: number[]; y: number[]; z: number[]; label: number[] };
};

const MOBILE_BREAKPOINT = 768;

export default function PerceptronScorePlane3d() {
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
    fetch('/data/ch20-perceptron-plane.json')
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

  const { x, y, z } = data.plane;
  const zeroPlane = z.map((row) => row.map(() => 0));

  const score = {
    x,
    y,
    z,
    type: 'surface' as const,
    colorscale: [
      [0, '#4363d8'],
      [0.5, '#d9d9d9'],
      [1, '#3cb44b'],
    ] as const,
    cmid: 0,
    opacity: 0.9,
    showscale: false,
    name: 'score W·X',
  };

  const threshold = {
    x,
    y,
    z: zeroPlane,
    type: 'surface' as const,
    colorscale: [
      [0, '#9ca3af'],
      [1, '#9ca3af'],
    ] as const,
    opacity: 0.25,
    showscale: false,
    name: 'W·X = 0',
  };

  const pts = (cls: number, color: string, label: string) => ({
    x: data.points.x.filter((_, i) => data.points.label[i] === cls),
    y: data.points.y.filter((_, i) => data.points.label[i] === cls),
    z: data.points.z.filter((_, i) => data.points.label[i] === cls),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: label,
    marker: { size: 3.5, color, opacity: 0.9 },
  });

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[
            threshold,
            score,
            pts(1, '#3cb44b', 'placed (positive)'),
            pts(0, '#4363d8', 'not placed (negative)'),
          ]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'CGPA (x₁)' } },
              yaxis: { title: { text: 'IQ (x₂)' } },
              zaxis: { title: { text: 'score  W·X' } },
              camera: { eye: { x: 2.0, y: -2.0, z: 0.7 } },
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
        The trained score <code>W·X = w₀ + w₁x₁ + w₂x₂</code> is a tilted plane over the feature space. The flat grey sheet is <code>W·X = 0</code>; the line where the two planes meet, projected straight down, is the decision boundary. Every student sits at its own score height: above the grey sheet the model predicts placed, below it not placed. After 1000 perceptron epochs all 100 points are on the correct side.
      </p>
    </div>
  );
}
