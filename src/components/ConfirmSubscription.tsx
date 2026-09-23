'use client';

import Link from 'next/link';
import { useState } from 'react';

type State = 'idle' | 'sending' | 'subscribed' | 'expired' | 'invalid' | 'error';

const RESULTS: Record<'subscribed' | 'expired' | 'invalid' | 'error', { title: string; body: string }> = {
  subscribed: { title: "You're subscribed", body: "You'll get an email when the next post goes up." },
  expired: { title: 'This link has expired', body: 'Confirmation links work for 48 hours. Subscribe again to get a new one.' },
  invalid: { title: 'This link is invalid', body: 'It may have been cut off when copied. Subscribe again to get a new one.' },
  error: { title: 'Something went wrong', body: 'Please try again in a minute.' },
};

export default function ConfirmSubscription({ token }: { token: string }) {
  const [state, setState] = useState<State>(token ? 'idle' : 'invalid');

  // Confirmation needs a click, not a page load, so mail scanners that open links can't subscribe anyone.
  async function confirm() {
    setState('sending');
    try {
      const res = await fetch('/api/subscribe/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json().catch(() => ({}))) as { status?: string };
      setState(data.status === 'subscribed' || data.status === 'expired' || data.status === 'invalid' ? data.status : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'idle' || state === 'sending') {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-2xl font-black mb-2">Confirm your subscription</p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">One click and you&apos;ll get new posts by email.</p>
        <button
          onClick={confirm}
          disabled={state === 'sending'}
          className="px-6 py-3 rounded-full text-sm font-bold bg-black dark:bg-white text-white dark:text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {state === 'sending' ? 'Confirming…' : 'Confirm subscription'}
        </button>
      </div>
    );
  }

  const result = RESULTS[state];
  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <p className="text-2xl font-black mb-2">{result.title}</p>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">{result.body}</p>
      {state === 'subscribed' && (
        <Link href="/" className="underline hover:text-amber-500">
          Back to the blog
        </Link>
      )}
      {(state === 'expired' || state === 'invalid') && (
        <Link href="/subscribe" className="underline hover:text-amber-500">
          Subscribe again
        </Link>
      )}
      {state === 'error' && (
        <button onClick={confirm} className="underline hover:text-amber-500">
          Try again
        </button>
      )}
    </div>
  );
}
