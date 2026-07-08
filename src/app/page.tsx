import Image from 'next/image';
import Link from 'next/link';
import { getAllPosts, getAllSeries } from '../lib/posts';
import { getSeriesTitle, hasCover } from '../lib/covers';
export default function Home() {
  const series = getAllSeries();
  const recentPosts = getAllPosts().slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-32 pt-8">
      {/* Ambient Glow */}
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Hero & Series Catalog */}
        <div className="lg:col-span-2">
          
          {/* Hero Banner (Featured Series) */}
          {series.length > 0 && (() => {
            const featuredSeriesSlug = series[0];
            return (
              <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 mb-12 shadow-2xl group min-h-[300px] md:min-h-[350px] flex items-end">
                {/* Background Image using Series Cover */}
                {hasCover(featuredSeriesSlug) && (
                  <Image
                    src={`/covers/${featuredSeriesSlug}.jpg`}
                    alt={getSeriesTitle(featuredSeriesSlug)}
                    fill
                    className="object-cover object-top opacity-80 dark:opacity-60 transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                {/* Dark Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                <div className="relative z-10 p-6 md:p-8 w-full max-w-4xl text-white">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider mb-4">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    Featured Series
                  </span>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 tracking-tight leading-tight line-clamp-2">
                    {getSeriesTitle(featuredSeriesSlug)}
                  </h1>
                  <p className="text-base md:text-lg text-white/80 font-medium mb-6 max-w-2xl line-clamp-2">
                    An in-depth collection exploring <span className="text-amber-500 font-semibold">{getSeriesTitle(featuredSeriesSlug)}</span> concepts, architectural patterns, and practical implementations.
                  </p>
                  <div className="flex flex-wrap items-center justify-start gap-4">
                    <Link 
                      href={`/${featuredSeriesSlug}`}
                      className="group/read relative overflow-hidden px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20"
                    >
                      <span className="relative z-10 group-hover/read:text-black dark:group-hover/read:text-white transition-colors duration-300">Explore Series →</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-x-full group-hover/read:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Series Catalog
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {series.map((s) => (
              <Link key={s} href={`/${s}`} className="relative flex flex-col rounded-3xl border border-black/10 dark:border-white/10 bg-[#0a0a0a] overflow-hidden group min-h-[300px] shadow-2xl transition-transform hover:-translate-y-1.5 duration-500">
                 {/* Background Image Container */}
                 <div className="absolute inset-0 overflow-hidden">
                   {hasCover(s) && (
                     <Image
                       src={`/covers/${s}.jpg`}
                       alt={getSeriesTitle(s)}
                       fill
                       className="object-cover object-top opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                     />
                   )}
                   {/* Deep gradients blending into the dark #0a0a0a base */}
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 via-35% to-[#0a0a0a]/0 to-75%" />
                 </div>
                 
                 {/* Content Container */}
                 <div className="relative z-10 flex flex-col h-full p-6 md:p-8">
                   {/* Top Badge */}
                   <div className="self-start px-4 py-1.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
                     Series Collection
                   </div>
                   
                   <div className="mt-auto pt-12">
                     {/* Floating Frosted Tags */}
                     <div className="flex flex-wrap gap-2 mb-4">
                       <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-lg">
                         System Design
                       </span>
                       <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-lg">
                         Deep Dive
                       </span>
                     </div>

                     {/* Massive Title */}
                     <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight leading-none group-hover:text-amber-500 transition-colors">
                       {getSeriesTitle(s)}
                     </h3>
                     
                     {/* Description with Highlighted text */}
                     <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl line-clamp-2">
                       An in-depth collection exploring <span className="text-amber-500 font-semibold">{getSeriesTitle(s)}</span> concepts, architectural patterns, and practical implementations.
                     </p>
                   </div>
                 </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          

          {/* Latest Posts */}
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-zinc-900 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 border-b border-black/5 dark:border-white/10 pb-3 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              Latest Posts
            </h3>
            <div className="flex flex-col gap-6">
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
                    {post.date}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-6 text-white shadow-xl shadow-amber-500/20">
            <div className="flex items-center gap-3 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <h3 className="font-bold text-lg">Stay in the loop</h3>
            </div>
            <p className="text-sm text-white/90 mb-6">
              Get the latest posts delivered straight to your inbox. No spam.
            </p>
            <form className="flex flex-col gap-3" action="#">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/20 px-4 py-2.5 rounded-lg text-sm outline-none placeholder:text-white/70 text-white border border-white/30 backdrop-blur-sm focus:border-white transition-colors"
              />
              <button className="bg-white text-amber-600 px-4 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-zinc-50 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
