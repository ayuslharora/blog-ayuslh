import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAllCategories,
  getSeriesByCategory,
  getCategoryTitle,
  getCategoryDescription,
} from '../../../lib/covers';
import SeriesCard from '../../../components/SeriesCard';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCategories().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = getSeriesByCategory(slug);
  if (series.length === 0) return {};

  const title = getCategoryTitle(slug);

  return {
    title: `${title} Series`,
    description: getCategoryDescription(slug),
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = getSeriesByCategory(slug);
  if (series.length === 0) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 pb-24 pt-12">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <header className="mb-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
          {getCategoryTitle(slug)}
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-secondary)] font-medium max-w-3xl">
          {getCategoryDescription(slug)}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <SeriesCard key={s} slug={s} />
        ))}
      </div>
    </div>
  );
}
