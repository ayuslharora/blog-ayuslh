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

const MOBILE_BREAKPOINT = 768;

// X^T X, X^T y, y^T y for the same 2-feature synthetic dataset used in the
// post (make_regression(n_samples=100, n_features=2, noise=15, random_state=13)).
// L(w1, w2) = w^T A w - 2 b^T w + c, so Ridge's loss is just this plus alpha*(w1^2+w2^2)
// and the minimum is the closed-form solution w = inv(A + alpha*I) b, both cheap
// enough to recompute on every slider tick without shipping a precomputed grid.
const A = [
  [75.86306863759016, -2.714111739555107],
  [-2.714111739555107, 78.88632720178435],
];
const B: [number, number] = [6079.65546473579, 1840.586032892604];
const C = 565964.8341630532;

const ALPHA_MIN = 0;
const ALPHA_MAX = 400;
const GRID_MIN = -20;
const GRID_MAX = 100;
const GRID_STEPS = 45;

function lossAt(w1: number, w2: number, alpha: number) {
  return (
    w1 * w1 * A[0][0] +
    2 * w1 * w2 * A[0][1] +
    w2 * w2 * A[1][1] -
    2 * (B[0] * w1 + B[1] * w2) +
    C +
    alpha * (w1 * w1 + w2 * w2)
  );
}

function minimumAt(alpha: number): { w1: number; w2: number; loss: number } {
  // Solve (A + alpha*I) w = B for the 2x2 system directly.
  const m00 = A[0][0] + alpha;
  const m01 = A[0][1];
  const m11 = A[1][1] + alpha;
  const det = m00 * m11 - m01 * m01;
  const w1 = (B[0] * m11 - B[1] * m01) / det;
  const w2 = (m00 * B[1] - m01 * B[0]) / det;
  return { w1, w2, loss: lossAt(w1, w2, alpha) };
}

export default function RidgeLambdaExplorer() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [alpha, setAlpha] = useState(20);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('resize', check);
  }, []);

  const grid = useMemo(() => {
    const axis = Array.from({ length: GRID_STEPS }, (_, i) => GRID_MIN + ((GRID_MAX - GRID_MIN) * i) / (GRID_STEPS - 1));
    return axis;
  }, []);

  const z = useMemo(
    () => grid.map((w2) => grid.map((w1) => lossAt(w1, w2, alpha))),
    [grid, alpha]
  );

  const min = useMemo(() => minimumAt(alpha), [alpha]);
  const ols = useMemo(() => minimumAt(0), []);

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

  const surface = {
    x: grid,
    y: grid,
    z,
    type: 'surface' as const,
    colorscale: 'Viridis' as const,
    opacity: 0.85,
    showscale: false,
    contours: {
      z: { show: true, usecolormap: true, highlightcolor: '#f58231', project: { z: true } },
    },
  };

  const minPoint = {
    x: [min.w1],
    y: [min.w2],
    z: [min.loss],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: 'Minimum at this alpha',
    marker: { size: 6, color: '#e6194b' },
  };

  const origin = {
    x: [0],
    y: [0],
    z: [lossAt(0, 0, alpha)],
    mode: 'markers' as const,
    type: 'scatter3d' as const,
    name: 'Origin (w1=w2=0)',
    marker: { size: 5, color: 'black', symbol: 'diamond' },
  };

  return (
    <div className="not-prose my-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2 sticky top-0 z-10 bg-white dark:bg-black/20 py-1">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium shrink-0">alpha (lambda)</label>
          <input
            type="range"
            min={ALPHA_MIN}
            max={ALPHA_MAX}
            step={1}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="w-32 sm:w-48"
          />
          <span className="text-xs tabular-nums w-10 text-right">{alpha}</span>
        </div>
        <span className="text-xs text-[var(--text-secondary)] tabular-nums">
          minimum at w1={min.w1.toFixed(2)}, w2={min.w2.toFixed(2)}
        </span>
        <span className="text-xs text-[var(--text-secondary)] tabular-nums">
          OLS (alpha=0) was w1={ols.w1.toFixed(2)}, w2={ols.w2.toFixed(2)}
        </span>
      </div>
      <Plot
        data={[surface, minPoint, origin]}
        layout={{
          autosize: true,
          height: 480,
          margin: { l: 0, r: 0, t: 10, b: 0 },
          scene: {
            xaxis: { title: { text: 'w1' }, range: [GRID_MIN, GRID_MAX] },
            yaxis: { title: { text: 'w2' }, range: [GRID_MIN, GRID_MAX] },
            zaxis: { title: { text: 'Loss' } },
            camera: { eye: { x: 1.6, y: -1.6, z: 0.9 } },
          },
          showlegend: true,
          legend: { x: 0, y: 1 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: isDark ? '#e5e5e5' : '#171717', size: 10 },
        }}
        config={{ responsive: true, displaylogo: false }}
        style={{ width: '100%' }}
        useResizeHandler
      />
    </div>
  );
}
