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
  points: { x: number[]; y: number[]; z0: number[]; z_rbf: number[]; label: number[] };
  plane_z: number;
};

const MOBILE_BREAKPOINT = 768;

export default function KernelLiftExplorer3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [lifted, setLifted] = useState(true);
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
    fetch('/data/ch35-kernel-lift.json')
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

  const zField = lifted ? data.points.z_rbf : data.points.z0;

  const cls = (c: number, color: string, symbol: 'x' | 'cross', name: string) => ({
    x: data.points.x.filter((_, i) => data.points.label[i] === c),
    y: data.points.y.filter((_, i) => data.points.label[i] === c),
    z: zField.filter((_, i) => data.points.label[i] === c),
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    marker: { size: 3.5, color, symbol },
    name,
  });

  const grid = [-3.2, 3.2];
  const plane = {
    x: grid,
    y: grid,
    z: [[data.plane_z, data.plane_z], [data.plane_z, data.plane_z]],
    type: 'surface' as const,
    colorscale: [
      [0, '#4363d8'],
      [1, '#4363d8'],
    ] as const,
    opacity: 0.3,
    showscale: false,
  };

  return (
    <div className="not-prose my-8">
      <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <Plot
          data={lifted ? [plane, cls(0, '#e6194b', 'x', 'red (inner)'), cls(1, '#3cb44b', 'cross', 'green (ring)')] : [cls(0, '#e6194b', 'x', 'red (inner)'), cls(1, '#3cb44b', 'cross', 'green (ring)')]}
          layout={{
            autosize: true,
            height: 460,
            margin: { l: 0, r: 0, t: 10, b: 0 },
            scene: {
              xaxis: { title: { text: 'x' }, range: [-3.2, 3.2] },
              yaxis: { title: { text: 'y' }, range: [-3.2, 3.2] },
              zaxis: { title: { text: lifted ? 'z = e^(-(x²+y²))' : '(flat, no z)' }, range: [-0.1, 1.05] },
              camera: lifted ? { eye: { x: 1.8, y: -1.8, z: 1.1 } } : { eye: { x: 0, y: 0, z: 2.6 } },
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
      <div className="flex items-center justify-center gap-4 mt-3">
        <button
          type="button"
          onClick={() => setLifted((s) => !s)}
          className="text-xs rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-[var(--text-secondary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
        >
          {lifted ? 'Flatten back to 2D' : 'Apply the RBF lift'}
        </button>
      </div>
      <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
        {lifted
          ? 'Lifted by z = exp(-(x² + y²)): the inner red cluster, closest to the origin, rises highest, while the outer green ring stays low. A single flat plane now separates the two classes. Drag to rotate.'
          : 'Flat, in the original two features: every straight line crosses both the red cluster and the green ring, so no line separates them.'}
      </p>
    </div>
  );
}
