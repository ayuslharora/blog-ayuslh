import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { getAllSeries, getPostsBySeries } from '../../lib/posts';
import { getSeriesTitle, getSeriesDescription, hasCover } from '../../lib/covers';
import { buildSeriesCollectionPageJsonLd, serializeJsonLd } from '../../lib/jsonLd';

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
    description: getSeriesDescription(series),
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
      <Script
        id="jsonld-series-collection"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildSeriesCollectionPageJsonLd(series, seriesTitle, getSeriesDescription(series), posts)
          ),
        }}
      />
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {hasCover(series) ? (
        <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 mb-12 shadow-2xl min-h-[250px] md:min-h-[350px] flex items-end">
          <Image
            src={`/covers/${series}.jpg`}
            alt={seriesTitle}
            fill
            priority
            className="object-cover object-center opacity-90 dark:opacity-70 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="relative z-10 p-6 md:p-10 w-full">
            <Link
              href="/series"
              className="group/back relative overflow-hidden inline-flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full mb-6 transition-all"
            >
              <span>← All Series</span>
            </Link>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-2 text-white drop-shadow-md tracking-tight">
              {seriesTitle}
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium drop-shadow-sm max-w-2xl">{getSeriesDescription(series)}</p>
          </div>
        </div>
      ) : (
        <div className="mb-12">
          <Link
            href="/series"
            className="group/back relative overflow-hidden inline-flex items-center gap-2 text-sm font-bold bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full mb-8 transition-transform hover:-translate-x-1"
          >
            <span className="relative z-10 group-hover/back:text-black dark:group-hover/back:text-white transition-colors duration-300">← All Series</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-x-full group-hover/back:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
          </Link>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gradient-gold tracking-tight">
            {seriesTitle}
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium max-w-2xl">{getSeriesDescription(series)}</p>
        </div>
      )}

      <ul className="space-y-3">
        {posts.map((post, i) => {
          const previousSubtopic = i > 0 ? posts[i - 1].subtopic : undefined;
          const showSubtopicHeading = post.subtopic !== undefined && post.subtopic !== previousSubtopic;

          return (
            <li key={post.slug}>
              {showSubtopicHeading && (
                <div className={i > 0 ? 'pt-6 mb-3' : 'mb-3'}>
                  <h2 className="text-sm font-bold text-amber-500 uppercase tracking-widest">
                    {post.subtopic}
                  </h2>
                  <div className="mt-2 h-px bg-black/10 dark:bg-white/10" />
                </div>
              )}
              <Link
                href={`/${series}/${post.slug}`}
                className="block p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:border-black/10 dark:hover:border-white/10 transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Post {i + 1}</span>
                  <span className="text-xs text-[var(--text-secondary)]">•</span>
                  <time dateTime={post.date.split('T')[0]} className="text-xs text-[var(--text-secondary)]">{post.date.split('T')[0]}</time>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] opacity-80">{post.description}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
