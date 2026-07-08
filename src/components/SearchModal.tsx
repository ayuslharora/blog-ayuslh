'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { searchEntries, type SearchEntry } from '../lib/searchIndex';

export default function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || entries !== null) return;
    setIsLoading(true);
    fetch('/search-index.json')
      .then((res) => res.json())
      .then((data: SearchEntry[]) => setEntries(data))
      .catch(() => setEntries([]))
      .finally(() => setIsLoading(false));
  }, [isOpen, entries]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = entries ? searchEntries(entries, query) : [];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-24 md:pt-32 px-4 bg-black/60 backdrop-blur-sm animate-fade-in-up"
      style={{ animationDuration: '0.15s' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/10 dark:border-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] shrink-0">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 bg-transparent outline-none text-base"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="text-[var(--text-secondary)] hover:text-black dark:hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <p className="px-5 py-8 text-center text-sm text-[var(--text-secondary)]">Loading...</p>
          )}

          {!isLoading && query.trim() && results.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-[var(--text-secondary)]">
              No posts match &ldquo;{query}&rdquo;.
            </p>
          )}

          {!isLoading && !query.trim() && (
            <p className="px-5 py-8 text-center text-sm text-[var(--text-secondary)]">
              Start typing to search posts.
            </p>
          )}

          {results.map((entry) => (
            <Link
              key={`${entry.series}/${entry.slug}`}
              href={`/${entry.series}/${entry.slug}`}
              onClick={onClose}
              className="block px-5 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors border-b border-black/5 dark:border-white/5 last:border-0"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1 block">
                {entry.seriesTitle}
              </span>
              <span className="font-semibold block">{entry.title}</span>
              <span className="text-sm text-[var(--text-secondary)] line-clamp-1">{entry.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
