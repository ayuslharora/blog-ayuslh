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

type Step = {
  label: string;
  caption: string;
  centroids: [number, number][];
  assign: number[] | null;
};

type StepsData = {
  points: [number, number][];
  steps: Step[];
};

const CLUSTER_COLORS = ['#e03131', '#12b886', '#1864ab'];
const NEUTRAL = '#868e96';

export default function KMeansIterationPlot() {
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<StepsData | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    fetch('/data/ch66-kmeans-steps.json')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="animate-pulse h-[460px] w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8" />;
  }

  const step = data.steps[stepIdx];
  const pointColors = step.assign
    ? step.assign.map((c) => CLUSTER_COLORS[c])
    : data.points.map(() => NEUTRAL);

  const pointTrace = {
    x: data.points.map((p) => p[0]),
    y: data.points.map((p) => p[1]),
    mode: 'markers' as const,
    type: 'scatter' as const,
    name: 'students',
    marker: { size: 14, color: pointColors, line: { color: isDark ? '#171717' : '#fff', width: 1.5 } },
    hoverinfo: 'x+y' as const,
  };

  const centroidTrace = {
    x: step.centroids.map((c) => c[0]),
    y: step.centroids.map((c) => c[1]),
    mode: 'markers' as const,
    type: 'scatter' as const,
    name: 'centroids',
    marker: {
      size: 20,
      symbol: 'triangle-up' as const,
      color: CLUSTER_COLORS,
      line: { color: isDark ? '#e5e5e5' : '#222', width: 1.5 },
    },
    hoverinfo: 'x+y' as const,
  };

  return (
    <div className="not-prose my-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {data.steps.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setStepIdx(i)}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
              stepIdx === i
                ? 'bg-amber-500 text-black'
                : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[pointTrace, centroidTrace]}
          layout={{
            autosize: true,
            height: 440,
            margin: { l: 50, r: 20, t: 20, b: 40 },
            showlegend: false,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: isDark ? '#e5e5e5' : '#171717' },
            xaxis: { title: { text: 'CGPA' }, zeroline: false, gridcolor: isDark ? '#333' : '#eee' },
            yaxis: { title: { text: 'IQ' }, zeroline: false, gridcolor: isDark ? '#333' : '#eee' },
            transition: { duration: 400, easing: 'cubic-in-out' },
          }}
          config={{ responsive: true, displaylogo: false }}
          style={{ width: '100%' }}
          useResizeHandler
        />
      </div>
      <p className="text-sm mt-3 text-center" style={{ color: 'var(--text-secondary)' }}>
        {step.caption}
      </p>
    </div>
  );
}
