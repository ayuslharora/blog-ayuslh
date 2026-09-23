'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: 'auto' | 'light' | 'dark';
      appearance?: 'always' | 'execute' | 'interaction-only';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }
  ) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

export default function SubscribeForm() {
  const widgetEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  // Explicit rendering, because implicit rendering only scans the page once and
  // misses the widget after a client-side navigation back to /subscribe.
  const renderWidget = useCallback(() => {
    if (!widgetEl.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(widgetEl.current, {
      sitekey: SITE_KEY,
      theme: 'auto',
      appearance: 'interaction-only',
      callback: setToken,
      'expired-callback': () => setToken(''),
      'error-callback': () => setToken(''),
    });
  }, []);

  useEffect(
    () => () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    },
    []
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), hpCheck: form.get('hpCheck'), turnstileToken: token }),
      });
      if (res.ok) {
        setStatus({ kind: 'sent' });
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus({ kind: 'error', message: data.error ?? 'Something went wrong. Please try again.' });
    } catch {
      setStatus({ kind: 'error', message: 'Network error. Please try again.' });
    } finally {
      // Turnstile tokens are single-use; get a fresh one for any retry.
      setToken('');
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    }
  }

  if (status.kind === 'sent') {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-2xl font-black mb-2">Check your inbox</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          Click the link in the email to confirm. It works for 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-card rounded-2xl p-6 md:p-8">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={renderWidget} />
      <label htmlFor="subscribe-email" className="block text-sm font-bold mb-2">
        Email
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="subscribe-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="flex-1 min-w-0 px-4 py-3 rounded-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={!token || status.kind === 'sending'}
          className="px-6 py-3 rounded-full text-sm font-bold bg-black dark:bg-white text-white dark:text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {status.kind === 'sending' ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
      <input
        type="text"
        name="hpCheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0"
      />
      <div ref={widgetEl} className="mt-4" />
      {status.kind === 'error' && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {status.message}
        </p>
      )}
    </form>
  );
}
