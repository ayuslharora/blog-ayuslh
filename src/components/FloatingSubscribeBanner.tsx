'use client';

import { useState } from 'react';

export default function FloatingSubscribeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-zinc-950 dark:bg-zinc-900 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl z-40 text-white hidden md:flex">
      {/* Dismiss Button */}
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute -top-3 -right-3 w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-colors z-50"
        aria-label="Close"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div className="flex items-center gap-4">
        <div className="text-3xl">🚀</div>
        <div>
          <h4 className="font-bold text-sm">Enjoying the content?</h4>
          <p className="text-xs text-white/60">Subscribe to get notified whenever I publish something new!</p>
        </div>
      </div>
      <form className="flex bg-white/10 p-1 rounded-full w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
        <input 
          type="email" 
          placeholder="Your email address" 
          className="bg-transparent px-4 text-sm outline-none placeholder:text-white/50 w-full md:w-48"
        />
        <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Subscribe
        </button>
      </form>
    </div>
  );
}
