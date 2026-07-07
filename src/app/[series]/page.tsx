import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSeries, getPostsBySeries } from '../../lib/posts';
import { getSeriesTitle } from '../../lib/covers';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSeries().map((series) => ({ series }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string }>;
}): Promise<Metadata> {
  const { series } = await params;
  const posts = getPostsBySeries(series);
  if (posts.length === 0) return {};

  const seriesTitle = getSeriesTitle(series);

  return {
    title: seriesTitle,
    description: `All posts in the "${seriesTitle}" series.`,
    alternates: { canonical: `/${series}` },
  };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  const { series } = await params;
  const posts = getPostsBySeries(series);
  if (posts.length === 0) notFound();
  
  const seriesTitle = getSeriesTitle(series);

  return (
    <div className="max-w-3xl mx-auto px-6 pb-24 pt-8">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="mb-12">
        <Link 
          href="/" 
          className="group/back relative overflow-hidden inline-flex items-center gap-2 text-sm font-bold bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full mb-8 transition-transform hover:-translate-x-1"
        >
          <span className="relative z-10 group-hover/back:text-black dark:group-hover/back:text-white transition-colors duration-300">← Back</span>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-x-full group-hover/back:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
        </Link>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gradient-gold tracking-tight">
          {seriesTitle}
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium">All posts in this series.</p>
      </div>

      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/${series}/${post.slug}`}
              className="block p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:border-black/10 dark:hover:border-white/10 transition-all hover:-translate-y-0.5 group"
            >
              <h3 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] opacity-80">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
