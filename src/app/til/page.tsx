import type { Metadata } from 'next';
import Image from 'next/image';
import { getTilPosts } from '../../lib/posts';
import { hasCover } from '../../lib/covers';
import TilFeed from '../../components/TilFeed';

export const metadata: Metadata = {
  title: 'Today I Learned (TIL)',
  description:
    'Unstructured learning log containing quick technical takeaways, video notes, and lightbulb moments on networking, pentesting, machine learning, and Linux.',
  alternates: { canonical: '/til' },
};

export default function TilIndexPage() {
  const posts = getTilPosts();
  const showCover = hasCover('til');

  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 pt-8">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {showCover ? (
        <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 mb-12 shadow-2xl min-h-[260px] md:min-h-[340px] flex items-end">
          <Image
            src="/covers/til.jpg"
            alt="Today I Learned"
            fill
            priority
            className="object-cover object-center opacity-90 dark:opacity-70 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
          <div className="relative z-10 p-6 md:p-10 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4 backdrop-blur-md">
              <span>⚡ Learning Log</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-3 text-white drop-shadow-md tracking-tight">
              Today I Learned
            </h1>
            <p className="text-base md:text-lg text-white/80 font-medium drop-shadow-sm max-w-2xl">
              Unstructured notes, technical takeaways, and lightbulb moments from random technical videos and talks.
            </p>
          </div>
        </div>
      ) : (
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4">
            <span>⚡ Learning Log</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-gradient-gold">
            Today I Learned
          </h1>
          <p className="text-xl text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">
            Unstructured notes, technical takeaways, and lightbulb moments from random YouTube videos, talks, and papers I consume.
          </p>
        </header>
      )}

      <TilFeed posts={posts} />
    </div>
  );
}
