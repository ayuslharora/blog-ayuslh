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
  classes: string[];
  x: number[];
  y: number[];
  proba: number[][][]; // [iy][ix][class]
  points: { x: number[]; y: number[]; label: number[] };
};

const MOBILE_BREAKPOINT = 768;
const COLORS = ['#4363d8', '#f58231', '#3cb44b'];

export default function SoftmaxSurfaces3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [envelope, setEnvelope] = useState(false);
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
    fetch('/data/ch28-softmax-surfaces.json')
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

  const ny = data.y.length;
  const nx = data.x.length;

  const classZ = (c: number) =>
    Array.from({ length: ny }, (_, i) =>
      Array.from({ length: nx }, (_, j) => data.proba[i][j][c])
    );

  const maxZ = Array.from({ length: ny }, (_, i) =>
    Array.from({ length: nx }, (_, j) => Math.max(...data.proba[i][j]))
  );

  const surfaces = envelope
    ? [
        {
          x: data.x,
          y: data.y,
          z: maxZ,
          type: 'surface' as const,
          colorscale: 'Viridis' as const,
          showscale: false,
          opacity: 0.95,
          contours: { z: { show: true, usecolormap: true, project: { z: true } } },
        },
      ]
    : data.classes.map((_, c) => ({
        x: data.x,
        y: data.y,
        z: classZ(c),
        type: 'surface' as const,
        colorscale: [
          [0, COLORS[c]],
          [1, COLORS[c]],
        ] as const,
        opacity: 0.55,
        showscale: false,
      }));

  const pts = data.classes.map((name, c) => ({
    x: data.points.x.filter((_, i) => data.points.label[i] === c),
    y: data.points.y.filter((_, i) => data.points.label[i] === c),
    z: data.points.x.filter((_, i) => data.points.label[i] === c).map(() => 0),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 3, color: COLORS[c] },
    name,
  }));

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[...surfaces, ...pts]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'sepal length' } },
              yaxis: { title: { text: 'petal length' } },
              zaxis: { title: { text: 'probability' }, range: [0, 1] },
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
      <div className="flex items-center justify-center gap-4 mt-3">
        <button
          type="button"
          onClick={() => setEnvelope((s) => !s)}
          className="text-xs rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
        >
          {envelope ? 'Show all three sheets' : 'Show only the winning probability'}
        </button>
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        Softmax outputs one probability sheet per species (blue setosa, orange versicolor, green virginica); at every point the three add to 1. Whichever sheet is highest is the predicted class, so the flat decision-region map is just this picture seen from directly above. The ridges where two sheets cross are the boundary lines.
      </p>
    </div>
  );
}
