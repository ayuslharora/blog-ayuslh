'use client';

import { useEffect } from 'react';
import { texToPlain } from '../lib/texToPlain';

// KaTeX renders formulas as absolutely-positioned glyph spans for display,
// so selecting/copying rendered math (e.g. a stacked fraction) copies a
// garbled run of characters instead of readable text. This intercepts the
// browser's copy event, finds any KaTeX nodes within the current selection,
// and substitutes each one with a plain-text version of its original LaTeX
// source (pulled from KaTeX's own <annotation> element), so pasting a
// formula like `\frac{1}{n}` produces `1/n` instead of glyph soup.
export default function KatexCopyFix() {
  useEffect(() => {
    function handleCopy(event: ClipboardEvent) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const fragment = range.cloneContents();
      const katexNodes = fragment.querySelectorAll('.katex');
      if (katexNodes.length === 0) return;

      katexNodes.forEach((node) => {
        const annotation = node.querySelector('annotation[encoding="application/x-tex"]');
        const plain = annotation?.textContent ? texToPlain(annotation.textContent) : '';
        node.replaceWith(document.createTextNode(plain));
      });

      const container = document.createElement('div');
      container.appendChild(fragment);
      const text = container.textContent ?? '';

      event.clipboardData?.setData('text/plain', text);
      event.preventDefault();
    }

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, []);

  return null;
}
