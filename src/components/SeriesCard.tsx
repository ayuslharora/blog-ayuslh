import Link from 'next/link';
import Image from 'next/image';
import {
  getSeriesTitle,
  getSeriesDescription,
  getSeriesCategory,
  getCategoryTitle,
  hasCover,
} from '../lib/covers';

export default function SeriesCard({ slug }: { slug: string }) {
  const categorySlug = getSeriesCategory(slug);

  return (
    <Link
      href={`/${slug}`}
      className="group relative h-64 sm:h-72 rounded-3xl border border-black/10 dark:border-white/10 bg-[#0a0a0a] overflow-hidden shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1.5 duration-500 flex flex-col justify-end"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 overflow-hidden">
        {hasCover(slug) && (
          <Image
            src={`/covers/${slug}.jpg`}
            alt={getSeriesTitle(slug)}
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
          {categorySlug && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                {getCategoryTitle(categorySlug)}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight leading-tight group-hover:text-amber-500 transition-colors">
            {getSeriesTitle(slug)}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-2">
            {getSeriesDescription(slug)}
          </p>
        </div>
      </div>
    </Link>
  );
}
