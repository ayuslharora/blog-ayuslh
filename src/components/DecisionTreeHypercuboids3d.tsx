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
  features: string[];
  classes: string[];
  grid: { x: number[]; y: number[]; z: number[]; label: number[] };
  points: { x: number[]; y: number[]; z: number[]; label: number[] };
  accuracy: number;
};

const MOBILE_BREAKPOINT = 768;
const COLORS = ['#4363d8', '#f58231', '#3cb44b'];

export default function DecisionTreeHypercuboids3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showRegions, setShowRegions] = useState(true);
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
    fetch('/data/ch37-hypercuboids.json')
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

  const region = (c: number) => ({
    x: data.grid.x.filter((_, i) => data.grid.label[i] === c),
    y: data.grid.y.filter((_, i) => data.grid.label[i] === c),
    z: data.grid.z.filter((_, i) => data.grid.label[i] === c),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 3, color: COLORS[c], opacity: 0.06 },
    name: data.classes[c],
  });

  const trainPts = (c: number) => ({
    x: data.points.x.filter((_, i) => data.points.label[i] === c),
    y: data.points.y.filter((_, i) => data.points.label[i] === c),
    z: data.points.z.filter((_, i) => data.points.label[i] === c),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 4, color: COLORS[c], line: { color: isDark ? '#fff' : '#000', width: 0.5 } },
    name: data.classes[c],
  });

  const regionTraces = showRegions ? [0, 1, 2].map(region) : [];
  const pointTraces = [0, 1, 2].map(trainPts);

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[...regionTraces, ...pointTraces]}
          layout={{
            autosize: true,
            height: 480,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: data.features[0] } },
              yaxis: { title: { text: data.features[1] } },
              zaxis: { title: { text: data.features[2] } },
              camera: { eye: { x: 1.8, y: -1.9, z: 1.0 } },
              aspectratio: { x: 1.2, y: 1.2, z: 1.0 },
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
          onClick={() => setShowRegions((s) => !s)}
          className="text-xs rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
        >
          {showRegions ? 'Hide' : 'Show'} the hypercuboid regions
        </button>
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        A depth-3 tree fit on three real Iris features, sepal length, petal length, petal width, instead of two. The faint clouds are a fine grid colored by the tree&apos;s prediction at that point; each is a block, a hypercuboid, because every split only ever cuts flat along one axis. Training accuracy: {(data.accuracy * 100).toFixed(1)}%. Drag to rotate and see the blocky, axis-aligned shape the video&apos;s &quot;imagine this in 3D&quot; exercise describes.
      </p>
    </div>
  );
}
