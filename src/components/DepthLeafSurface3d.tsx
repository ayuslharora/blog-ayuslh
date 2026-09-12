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
  depths: number[];
  leaves: number[];
  accuracy: number[][];
  best: { depth: number; leaf: number; accuracy: number };
};

const MOBILE_BREAKPOINT = 768;

export default function DepthLeafSurface3d() {
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
    fetch('/data/ch39-depth-leaf-surface.json')
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

  const surface = {
    x: data.depths,
    y: data.leaves,
    z: data.accuracy,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    showscale: true,
    colorbar: { title: { text: 'test acc' }, thickness: 12, len: 0.6 },
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
  };

  const best = {
    x: [data.best.depth],
    y: [data.best.leaf],
    z: [data.best.accuracy],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 5, color: '#e6194b', symbol: 'diamond' as const },
    name: 'best',
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={[surface, best]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'max_depth' } },
              yaxis: { title: { text: 'min_samples_leaf' } },
              zaxis: { title: { text: 'test accuracy' } },
              camera: { eye: { x: 1.9, y: -2.0, z: 1.0 } },
              aspectratio: { x: 1.2, y: 1.2, z: 0.8 },
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
        Test accuracy over both hyperparameters at once, rather than sweeping one at a time. The ridge running along <code>min_samples_leaf = 5</code> stays at its peak across every depth from 6 up, more robust to an overly deep tree than <code>min_samples_leaf = 1</code>, which dips slightly once the tree is allowed to grow past its best depth. Large <code>min_samples_leaf</code> (20, 40) flattens into an underfit plateau regardless of depth, depth alone can't rescue a leaf-size constraint that's too tight.
      </p>
    </div>
  );
}
