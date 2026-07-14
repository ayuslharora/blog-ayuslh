import type { Heading } from '../lib/extractHeadings';

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  return (
    <nav
      aria-label="Table of contents"
      className="not-prose mb-12 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-6"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
        In this chapter
      </p>
      <ol className="space-y-2">
        {headings.map((h, i) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="flex gap-3 text-sm text-[var(--text-secondary)] hover:text-amber-500 transition-colors"
            >
              <span className="font-mono text-amber-500/60">{String(i + 1).padStart(2, '0')}</span>
              <span>{h.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
