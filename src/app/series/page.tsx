import Link from 'next/link';
import Image from 'next/image';
import { getAllSeries } from '../../lib/posts';
import { getSeriesTitle, getSeriesDescription, hasCover } from '../../lib/covers';

export const metadata = {
  title: 'Series Catalog',
  description:
    'Browse every series on the blog, from Designing Data-Intensive Applications notes to a Networking Fundamentals series covering HTTP, DNS, and IP addressing.',
};

export default function SeriesPage() {
  const series = getAllSeries();

  return (
    <div className="max-w-6xl mx-auto px-6 pb-24 pt-12">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <header className="mb-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
          Series <span className="text-amber-500">Catalog</span>
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-secondary)] font-medium max-w-3xl">
          Deep-dive collections into system design, data architecture, and software engineering principles.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <Link 
            key={s}
            href={`/${s}`}
            className="group relative h-64 sm:h-72 rounded-3xl border border-black/10 dark:border-white/10 bg-[#0a0a0a] overflow-hidden shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1.5 duration-500 flex flex-col justify-end"
          >
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
            <div className="relative z-10 flex flex-col h-full p-6">
              {/* Top Badge */}
              <div className="self-start px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
                Collection
              </div>
              
              <div className="mt-auto pt-8">
                {/* Floating Frosted Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    System Design
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight leading-tight group-hover:text-amber-500 transition-colors">
                  {getSeriesTitle(s)}
                </h3>
                
                {/* Description */}
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-2">
                  {getSeriesDescription(s)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
