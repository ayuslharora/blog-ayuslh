'use client';

import { useEffect, useMemo, useState } from 'react';
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
  query: { x: number; y: number; z: number; true_label: number };
  train: { x: number[]; y: number[]; z: number[]; label: number[] };
  neighbor_order: number[];
  neighbor_dist: number[];
};

const MOBILE_BREAKPOINT = 768;
const K_OPTIONS = [3, 7, 15, 41];
const BENIGN = '#3cb44b';
const MALIGNANT = '#e6194b';

export default function KnnNeighbors3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [k, setK] = useState(7);
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
    fetch('/data/ch31-knn-neighbors.json')
      .then((res) => res.json())
      .then(setData);
  }, [isDesktop]);

  const vote = useMemo(() => {
    if (!data) return null;
    const nn = data.neighbor_order.slice(0, k);
    const benign = nn.filter((i) => data.train.label[i] === 1).length;
    return { benign, malignant: k - benign, winner: benign > k - benign ? 'benign' : 'malignant' };
  }, [data, k]);

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

  if (!data || !vote) {
    return <div className="animate-pulse h-[460px] w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8" />;
  }

  const nn = data.neighbor_order.slice(0, k);
  const nnSet = new Set(nn);

  const bg = (cls: number, color: string, name: string) => ({
    x: data.train.x.filter((_, i) => data.train.label[i] === cls && !nnSet.has(i)),
    y: data.train.y.filter((_, i) => data.train.label[i] === cls && !nnSet.has(i)),
    z: data.train.z.filter((_, i) => data.train.label[i] === cls && !nnSet.has(i)),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 2.5, color, opacity: 0.35 },
    name,
  });

  const neighborsTrace = {
    x: nn.map((i) => data.train.x[i]),
    y: nn.map((i) => data.train.y[i]),
    z: nn.map((i) => data.train.z[i]),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: {
      size: 5,
      color: nn.map((i) => (data.train.label[i] === 1 ? BENIGN : MALIGNANT)),
      line: { color: isDark ? '#e5e5e5' : '#171717', width: 1 },
    },
    name: `${k} nearest`,
  };

  const spokes = {
    x: nn.flatMap((i) => [data.query.x, data.train.x[i], null as unknown as number]),
    y: nn.flatMap((i) => [data.query.y, data.train.y[i], null as unknown as number]),
    z: nn.flatMap((i) => [data.query.z, data.train.z[i], null as unknown as number]),
    mode: 'lines' as const,
    type: 'scatter3d' as const,
    line: { color: isDark ? '#9ca3af' : '#6b7280', width: 1 },
    name: '',
  };

  const queryTrace = {
    x: [data.query.x],
    y: [data.query.y],
    z: [data.query.z],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 7, color: '#111827', symbol: 'diamond' as const, line: { color: '#fff', width: 1 } },
    name: 'query',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[bg(1, BENIGN, 'benign'), bg(0, MALIGNANT, 'malignant'), spokes, neighborsTrace, queryTrace]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: data.features[0] } },
              yaxis: { title: { text: data.features[1] } },
              zaxis: { title: { text: data.features[2] } },
              camera: { eye: { x: 1.9, y: -2.0, z: 0.9 } },
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
      <div className="flex items-center justify-center gap-2 mt-3">
        {K_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setK(opt)}
            className={`text-xs rounded-full border px-3 py-1 transition-colors ${
              k === opt
                ? 'border-transparent bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'border-black/10 dark:border-white/15 text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
            }`}
          >
            K = {opt}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        Standardized breast-cancer data (three features). The black query point sits right on the class boundary; its true label is <strong>benign</strong>. At <code>K = {k}</code> the vote is {vote.malignant} malignant to {vote.benign} benign, so KNN predicts <strong>{vote.winner}</strong>. The three closest points are a malignant pocket; only widening K past ~30 recovers the benign majority that matches the truth.
      </p>
    </div>
  );
}
