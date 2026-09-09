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
  labels: number[];
  counts: number[][];
  accuracy: number;
  top_confusion: { true: number; pred: number; count: number };
};

const MOBILE_BREAKPOINT = 768;

export default function ConfusionMatrix3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [errorsOnly, setErrorsOnly] = useState(false);
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
    fetch('/data/ch25-digits-confusion.json')
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

  const z = data.counts.map((row, i) =>
    row.map((v, j) => (errorsOnly && i === j ? 0 : v))
  );

  const surface = {
    x: data.labels,
    y: data.labels,
    z,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    showscale: true,
    colorbar: { title: { text: 'count' }, thickness: 12, len: 0.6 },
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'predicted digit' }, dtick: 1 },
              yaxis: { title: { text: 'true digit' }, dtick: 1 },
              zaxis: { title: { text: 'count' } },
              camera: { eye: { x: 1.9, y: -1.9, z: 1.0 } },
              aspectratio: { x: 1.2, y: 1.2, z: 0.7 },
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
          onClick={() => setErrorsOnly((s) => !s)}
          className="text-xs rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
        >
          {errorsOnly ? 'Show the full matrix' : 'Flatten the diagonal (errors only)'}
        </button>
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        A 10-class confusion matrix on sklearn's 8×8 digits (a quick stand-in for MNIST), Logistic Regression at {(data.accuracy * 100).toFixed(1)}% accuracy. The diagonal is a wall of correct predictions; every other cell is a specific confusion. Flatten the diagonal to see the errors on their own, here the tallest is a true {data.top_confusion.true} read as {data.top_confusion.pred} ({data.top_confusion.count} times).
      </p>
    </div>
  );
}
