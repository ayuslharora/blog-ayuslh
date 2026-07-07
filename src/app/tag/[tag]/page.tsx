import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllTags, getPostsByTag } from '../../../lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) return {};

  return {
    title: `#${tag}`,
    description: `All posts tagged "${tag}".`,
    alternates: { canonical: `/tag/${tag}` },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">#{tag}</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={`${post.series}/${post.slug}`}>
            <Link
              href={`/${post.series}/${post.slug}`}
              className="text-lg font-medium hover:text-amber-500 transition-colors"
            >
              {post.title}
            </Link>
            <p className="text-sm text-zinc-500">{post.date} · {post.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
