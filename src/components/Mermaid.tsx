'use client';

import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

export default function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>('');
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Configure mermaid with colors that match the blog's amber theme
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '16px',
        primaryColor: '#fef3c7',
        primaryTextColor: '#050505',
        primaryBorderColor: '#fbbf24',
        lineColor: '#fbbf24',
        secondaryColor: '#f59e0b',
        tertiaryColor: '#d97706',
        // Sequence diagram variables for high-contrast dark theme readability
        actorBkg: '#78350f',
        actorTextColor: '#ffffff',
        actorBorder: '#f59e0b',
        actorLineColor: '#f59e0b',
        signalColor: '#f59e0b',
        signalTextColor: '#ffffff',
        labelBoxBkgColor: '#18181b',
        labelBoxBorderColor: '#3f3f46',
        labelTextColor: '#ffffff',
        noteBkgColor: '#27272a',
        noteTextColor: '#fbbf24',
        noteBorderColor: '#f59e0b',
        sequenceNumberColor: '#ffffff',
        // xychart-beta's line color otherwise falls back to a near-white
        // default (#FFF4DD), which is invisible against a white card.
        // Second color is for reference/threshold lines (e.g. ssthresh)
        // plotted as a second series alongside the primary data line.
        xyChart: {
          plotColorPalette: '#f97316,#a78bfa',
        },
      },
      flowchart: {
        htmlLabels: true,
        padding: 20
      },
      securityLevel: 'loose',
    });

    mermaid.render(id.current, chart).then((result) => {
      // xychart-beta hardcodes its line stroke-width to 2 with no theme
      // override available, which reads as too thin at chart scale
      const svg = result.svg.replace(
        /(class="line-plot-\d+"><path[^>]*stroke-width=")2(")/g,
        '$13.5$2'
      );
      setSvg(svg);
    }).catch((e) => {
      console.error(e);
      setSvg(`<p class="text-red-500 text-sm">Failed to render Mermaid diagram.</p>`);
    });
  }, [chart]);

  if (!svg) {
    return <div className="animate-pulse h-32 w-full bg-black/5 dark:bg-white/5 rounded-2xl my-8"></div>;
  }

  return (
    <div 
      className="mermaid-wrapper flex w-full my-8 p-4 md:p-6 bg-white dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 overflow-x-auto [&_svg]:m-auto [&_svg]:w-full [&_svg]:h-auto [&_svg]:min-w-[600px]"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}
