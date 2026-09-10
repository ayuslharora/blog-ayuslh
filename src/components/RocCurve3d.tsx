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
  fpr: number[];
  tpr: number[];
  threshold: number[];
  best: { fpr: number; tpr: number; threshold: number };
};

const MOBILE_BREAKPOINT = 768;

export default function RocCurve3d() {
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
    fetch('/data/ch27-roc-3d.json')
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

  const zero = data.fpr.map(() => 0);

  const path3d = {
    x: data.fpr,
    y: data.tpr,
    z: data.threshold,
    mode: 'lines+markers' as const,
    type: 'scatter3d' as const,
    line: { color: '#4363d8', width: 4 },
    marker: { size: 2, color: '#4363d8' },
    name: '(FPR, TPR, threshold)',
  };

  const shadow = {
    x: data.fpr,
    y: data.tpr,
    z: zero,
    mode: 'lines' as const,
    type: 'scatter3d' as const,
    line: { color: '#9ca3af', width: 3 },
    name: 'ROC curve (shadow at threshold 0)',
  };

  const diagonal = {
    x: [0, 1],
    y: [0, 1],
    z: [0, 0],
    mode: 'lines' as const,
    type: 'scatter3d' as const,
    line: { color: '#9ca3af', width: 1, dash: 'dash' as const },
    name: 'random baseline',
  };

  const drop = {
    x: [data.best.fpr, data.best.fpr],
    y: [data.best.tpr, data.best.tpr],
    z: [0, data.best.threshold],
    mode: 'lines' as const,
    type: 'scatter3d' as const,
    line: { color: '#e6194b', width: 2, dash: 'dot' as const },
    name: '',
  };

  const bestMarker = {
    x: [data.best.fpr],
    y: [data.best.tpr],
    z: [data.best.threshold],
    mode: 'markers+text' as const,
    type: 'scatter3d' as const,
    text: [`threshold ${data.best.threshold.toFixed(2)}`],
    textposition: 'top center' as const,
    marker: { size: 5, color: '#e6194b', symbol: 'diamond' as const },
    name: '',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[shadow, diagonal, path3d, drop, bestMarker]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'FPR (cost)' }, range: [0, 1] },
              yaxis: { title: { text: 'TPR (benefit)' }, range: [0, 1] },
              zaxis: { title: { text: 'threshold' }, range: [0, 1] },
              camera: { eye: { x: 1.9, y: -2.0, z: 1.0 } },
              aspectratio: { x: 1.2, y: 1.2, z: 0.9 },
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
        Every threshold from 1 (bottom) to 0 (top) maps to one <code>(FPR, TPR)</code> point; stacking them by threshold turns the ROC curve into a 3D path. The grey curve on the floor is the ordinary 2D ROC plot, this path's shadow. The marked operating point, threshold {data.best.threshold.toFixed(2)}, is the one whose shadow sits closest to the top-left (FPR 0, TPR 1) corner.
      </p>
    </div>
  );
}
