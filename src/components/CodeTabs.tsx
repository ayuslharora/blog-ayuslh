'use client';

import type { ReactNode } from 'react';

// Python/JavaScript toggle for a code sample written in both languages.
// In MDX, wrap a ```python fence and a ```js fence in <CodeTabs>.
//
// The chosen language is one site-wide preference, not per-block state: it
// lives on <html data-code-lang>, which the init script in layout.tsx sets
// from localStorage before first paint, and globals.css hides the other
// language. So every CodeTabs on the page switches together, and a returning
// reader never sees a flash of the wrong language.

const LANGS = [
  { id: 'python', label: 'Python' },
  { id: 'js', label: 'JavaScript' },
] as const;

const CODE_LANG_STORAGE_KEY = 'code-lang';

function selectLang(lang: string, button: HTMLElement) {
  // Switching changes the height of every tabbed block above this one; keep
  // the clicked button at the same screen position so the page doesn't jump.
  const before = button.getBoundingClientRect().top;
  document.documentElement.setAttribute('data-code-lang', lang);
  try {
    window.localStorage.setItem(CODE_LANG_STORAGE_KEY, lang);
  } catch {}
  window.scrollBy(0, button.getBoundingClientRect().top - before);
}

export default function CodeTabs({ children }: { children: ReactNode }) {
  return (
    <div className="code-tabs">
      <div className="code-tabs-bar" role="group" aria-label="Code language">
        {LANGS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            data-lang={id}
            className="code-tab"
            onClick={(e) => selectLang(id, e.currentTarget)}
          >
            {label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
