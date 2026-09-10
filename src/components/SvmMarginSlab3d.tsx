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
  margin_width: number;
  points: { x: number[]; y: number[]; z: number[]; label: number[]; support: number[] };
};

const MOBILE_BREAKPOINT = 768;

export default function SvmMarginSlab3d() {
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
    fetch('/data/ch32-svm-margin-3d.json')
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

  const flat = (level: number, color: string, op: number) => ({
    x: data.x,
    y: data.y,
    z: data.z.map((row) => row.map(() => level)),
    type: 'surface' as const,
    colorscale: [
      [0, color],
      [1, color],
    ] as const,
    opacity: op,
    showscale: false,
  });

  const score = {
    x: data.x,
    y: data.y,
    z: data.z,
    type: 'surface' as const,
    colorscale: [
      [0, '#e6194b'],
      [0.5, '#d9d9d9'],
      [1, '#3cb44b'],
    ] as const,
    cmid: 0,
    opacity: 0.9,
    showscale: false,
  };

  const pick = (fn: (i: number) => boolean) => ({
    x: data.points.x.filter((_, i) => fn(i)),
    y: data.points.y.filter((_, i) => fn(i)),
    z: data.points.z.filter((_, i) => fn(i)),
  });

  const regular = (cls: number, color: string) => {
    const p = pick((i) => data.points.label[i] === cls && data.points.support[i] === 0);
    return {
      ...p,
      mode: 'markers' as const,
      type: 'scatter3d' as const,
      marker: { size: 3, color, opacity: 0.85 },
      name: cls === 1 ? 'class 1' : 'class 0',
    };
  };

  const svs = pick((i) => data.points.support[i] === 1);
  const supportTrace = {
    ...svs,
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 6, color: '#f59e0b', symbol: 'diamond' as const, line: { color: isDark ? '#fff' : '#000', width: 1 } },
    name: 'support vectors',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[flat(0, '#9ca3af', 0.15), flat(1, '#3cb44b', 0.12), flat(-1, '#e6194b', 0.12), score, regular(1, '#3cb44b'), regular(0, '#e6194b'), supportTrace]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'x₁' } },
              yaxis: { title: { text: 'x₂' } },
              zaxis: { title: { text: 'score  wᵀx + b' } },
              camera: { eye: { x: 2.0, y: -2.0, z: 0.7 } },
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
        The score <code>wᵀx + b</code> is a tilted plane; the boundary is where it meets the grey <code>score = 0</code> sheet, and the two faint sheets at <code>score = +1</code> and <code>score = -1</code> are the margin edges. Every point sits at its own score height. The support vectors (amber) are exactly the points resting on the <code>±1</code> sheets, and SVM tilts the plane to make the gap between those sheets, here {data.margin_width.toFixed(2)} wide, as large as possible.
      </p>
    </div>
  );
}
