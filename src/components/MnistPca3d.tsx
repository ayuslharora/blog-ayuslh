'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Plotly's bundle is ~3MB; dynamic-import with ssr:false so it's only ever
// fetched on desktop, after the viewport check below decides to render it.
// plotly.js-dist-min (not the full plotly.js) keeps that bundle smaller by
// dropping unused chart types, wired up via react-plotly.js's factory API.
const Plot = dynamic(
  () =>
    Promise.all([import('react-plotly.js/factory'), import('plotly.js-dist-min')]).then(
      ([{ default: createPlotlyComponent }, { default: Plotly }]) => createPlotlyComponent(Plotly)
    ),
  { ssr: false }
);

type Point = [number, number, number, number]; // PC1, PC2, PC3, digit

const DIGIT_COLORS = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#9a6324', '#000075',
];

const MOBILE_BREAKPOINT = 768;

export default function MnistPca3d() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<Point[] | null>(null);
  const [selectedDigit, setSelectedDigit] = useState<number | 'all'>('all');

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    fetch('/data/ch40-mnist-pca3.json')
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

  const digits = selectedDigit === 'all' ? [...Array(10).keys()] : [selectedDigit];

  const traces = digits.map((digit) => {
    const filtered = data.filter((p) => p[3] === digit);
    return {
      x: filtered.map((p) => p[0]),
      y: filtered.map((p) => p[1]),
      z: filtered.map((p) => p[2]),
      mode: 'markers' as const,
      type: 'scatter3d' as const,
      name: `${digit}`,
      marker: { size: 4, color: DIGIT_COLORS[digit], opacity: 0.8 },
    };
  });

  return (
    <div className="not-prose my-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={() => setSelectedDigit('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
            selectedDigit === 'all'
              ? 'bg-amber-500 text-black'
              : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
          }`}
        >
          All
        </button>
        {[...Array(10).keys()].map((digit) => (
          <button
            key={digit}
            onClick={() => setSelectedDigit(digit)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
              selectedDigit === digit
                ? 'text-black'
                : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
            }`}
            style={selectedDigit === digit ? { backgroundColor: DIGIT_COLORS[digit] } : undefined}
          >
            {digit}
          </button>
        ))}
      </div>
      <div className="mnist-pca3d-plot rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden">
        <style>{`
          .mnist-pca3d-plot .legendpoints path {
            transform-box: fill-box;
            transform-origin: center;
            transform: translate(20px, 0) scale(2.2);
          }
        `}</style>
        <Plot
          data={traces}
          layout={{
            autosize: true,
            height: 550,
            margin: { l: 0, r: 0, t: 30, b: 0 },
            scene: {
              xaxis: { title: { text: 'PC1' } },
              yaxis: { title: { text: 'PC2' } },
              zaxis: { title: { text: 'PC3' } },
            },
            legend: { title: { text: 'digit' } },
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
