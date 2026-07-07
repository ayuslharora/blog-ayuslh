import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSeries, getPostsBySeries } from '../../lib/posts';

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

  return {
    title: series,
    description: `All posts in the "${series}" series.`,
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">{series}</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/${series}/${post.slug}`}
              className="text-lg font-medium hover:text-amber-500 transition-colors"
            >
              {post.title}
            </Link>
            <p className="text-sm text-zinc-500">{post.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
