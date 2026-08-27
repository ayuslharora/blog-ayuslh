import Image from 'next/image';
import Link from 'next/link';
import { getAllPosts, getAllSeries, getPostBySlug, getPostsBySeries } from '../lib/posts';
import { getSeriesTitle, getSeriesDescription, hasCover } from '../lib/covers';
import { getReadingTimeMinutes } from '../lib/readingTime';
import { formatTagLabel } from '../lib/format';

export default function Home() {
  const series = getAllSeries();
  const recentPosts = getAllPosts().slice(0, 6);
  const latestPostMeta = recentPosts[0];
  const latestPost = latestPostMeta
    ? getPostBySlug(latestPostMeta.series, latestPostMeta.slug)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-32 pt-8">
      {/* Ambient Glow */}
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Hero Banner (Latest Post) */}
        {latestPost && (
          <div className="lg:col-span-2">
            <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 shadow-2xl group min-h-[300px] md:min-h-[350px] flex items-end">
              {/* Background Image using Series Cover */}
              {hasCover(latestPost.series) && (
                <Image
                  src={`/covers/${latestPost.series}.jpg`}
                  alt={latestPost.title}
                  fill
                  priority
                  className="object-cover object-top opacity-80 dark:opacity-60 transition-transform duration-700 group-hover:scale-105"
                />
              )}
              {/* Dark Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="relative z-10 p-6 md:p-8 w-full max-w-4xl text-white">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider mb-4">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Latest Post
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 tracking-tight leading-tight line-clamp-2">
                  {latestPost.title}
                </h1>
                <p className="text-base md:text-lg text-white/80 font-medium mb-6 max-w-2xl line-clamp-2">
                  {latestPost.description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-sm text-white/70 font-medium">
                    {getSeriesTitle(latestPost.series)} · {latestPost.date.split('T')[0]} · {getReadingTimeMinutes(latestPost.content)} min read
                  </span>
                  <Link
                    href={`/${latestPost.series}/${latestPost.slug}`}
                    className="group/read relative overflow-hidden px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    <span className="relative z-10 group-hover/read:text-black dark:group-hover/read:text-white transition-colors duration-300">Read the post →</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-x-full group-hover/read:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column (Sidebar) - Stacked middle on mobile */}
        <div className="lg:col-span-1">
          {/* Latest Posts - height-capped to the banner on desktop, scrolls internally */}
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-zinc-900 p-6 shadow-sm flex flex-col lg:h-full">
            <h3 className="font-bold text-lg mb-6 border-b border-black/5 dark:border-white/10 pb-3 flex items-center gap-2 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              Latest Posts
            </h3>
            <div className="flex flex-col gap-6 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2 lg:[mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)]">
              {recentPosts.map((post) => (
                <Link
                  key={`${post.series}/${post.slug}`}
                  href={`/${post.series}/${post.slug}`}
                  className="flex flex-col overflow-hidden group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5 block">
                    {getSeriesTitle(post.series)}
                  </span>
                  <h4 className="text-base font-bold mb-1.5 group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    {post.date.split('T')[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Series Catalog */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Series Catalog
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.map((s) => {
              const seriesPosts = getPostsBySeries(s);
              const seriesTags = Array.from(new Set(seriesPosts.flatMap((p) => p.tags)));

              return (
                <Link key={s} href={`/${s}`} className="group flex flex-col rounded-3xl border border-black/10 dark:border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl transition-transform hover:-translate-y-1.5 duration-500">
                   {/* Image header - fixed ratio, fully visible */}
                   <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a0a0a]">
                     {hasCover(s) && (
                       <Image
                         src={`/covers/${s}.jpg`}
                         alt={getSeriesTitle(s)}
                         fill
                         className="object-cover object-center opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                       />
                     )}
                     {/* Short blend into the card body */}
                     <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                     {/* Chapter badge */}
                     <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
                       {seriesPosts.length} {seriesPosts.length === 1 ? 'Chapter' : 'Chapters'}
                     </div>
                   </div>

                   {/* Content panel */}
                   <div className="flex flex-col flex-1 p-6">
                     {/* Frosted Tags */}
                     {seriesTags.length > 0 && (
                       <div className="flex flex-wrap gap-2 mb-4">
                         {seriesTags.slice(0, 5).map((tag) => (
                           <span
                             key={tag}
                             className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                           >
                             {formatTagLabel(tag)}
                           </span>
                         ))}
                       </div>
                     )}

                     {/* Title */}
                     <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight leading-tight group-hover:text-amber-500 transition-colors">
                       {getSeriesTitle(s)}
                     </h3>

                     {/* Description */}
                     <p className="text-sm text-white/70 leading-relaxed line-clamp-2">
                       {getSeriesDescription(s)}
                     </p>
                   </div>
                </Link>
              );
            })}
          </div>
        </div>


      </div>
    </div>
  );
}
