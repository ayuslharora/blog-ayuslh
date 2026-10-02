'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Same lazy Plotly setup as MnistPca3d: dist-min bundle, client-only, desktop-only.
const Plot = dynamic(
  () =>
    Promise.all([import('react-plotly.js/factory'), import('plotly.js-dist-min')]).then(
      ([{ default: createPlotlyComponent }, { default: Plotly }]) => createPlotlyComponent(Plotly)
    ),
  { ssr: false }
);

type Point = [number, number, number, number]; // col1, col2, col3, K-means label

const CLUSTER_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#eab308'];

const MOBILE_BREAKPOINT = 768;

export default function KMeansBlobs3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<Point[] | null>(null);
  const [view, setView] = useState<'raw' | 'clustered'>('clustered');

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    fetch('/data/ch67-kmeans-3d.json')
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

  const traces =
    view === 'raw'
      ? [
          {
            x: data.map((p) => p[0]),
            y: data.map((p) => p[1]),
            z: data.map((p) => p[2]),
            mode: 'markers' as const,
            type: 'scatter3d' as const,
            name: 'unlabeled',
            marker: { size: 4, color: isDark ? '#a3a3a3' : '#525252', opacity: 0.8 },
          },
        ]
      : [0, 1, 2, 3].map((label) => {
          const filtered = data.filter((p) => p[3] === label);
          return {
            x: filtered.map((p) => p[0]),
            y: filtered.map((p) => p[1]),
            z: filtered.map((p) => p[2]),
            mode: 'markers' as const,
            type: 'scatter3d' as const,
            name: `cluster ${label}`,
            marker: { size: 4, color: CLUSTER_COLORS[label], opacity: 0.85 },
          };
        });

  const tabs: { key: 'raw' | 'clustered'; label: string }[] = [
    { key: 'raw', label: 'Raw data' },
    { key: 'clustered', label: 'K-means, K = 4' },
  ];

  return (
    <div className="not-prose my-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
              view === tab.key
                ? 'bg-amber-500 text-black'
                : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={traces}
          layout={{
            autosize: true,
            height: 550,
            margin: { l: 0, r: 0, t: 30, b: 0 },
            scene: {
              xaxis: { title: { text: 'col1' } },
              yaxis: { title: { text: 'col2' } },
              zaxis: { title: { text: 'col3' } },
            },
            showlegend: view === 'clustered',
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
