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
        fontFamily: 'inherit',
        primaryColor: '#fef3c7',
        primaryTextColor: '#050505',
        primaryBorderColor: '#fbbf24',
        lineColor: '#fbbf24',
        secondaryColor: '#f59e0b',
        tertiaryColor: '#d97706',
      },
      securityLevel: 'loose',
    });
    
    mermaid.render(id.current, chart).then((result) => {
      setSvg(result.svg);
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
      className="mermaid-wrapper flex justify-center my-8 p-6 bg-white dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 overflow-x-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}
