import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPostBySlug } from '../../../lib/posts';
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd, serializeJsonLd } from '../../../lib/jsonLd';
import ChatWidget from '../../../components/ChatWidget';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ series: post.series, slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string; slug: string }>;
}): Promise<Metadata> {
  const { series, slug } = await params;
  const post = getPostBySlug(series, slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/${series}/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/${series}/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ series: string; slug: string }>;
}) {
  const { series, slug } = await params;
  const post = getPostBySlug(series, slug);
  if (!post) notFound();

  return (
    <>
      <article className="max-w-3xl mx-auto px-6 py-12 prose">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBlogPostingJsonLd(post)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBreadcrumbJsonLd(post)) }}
        />
        <h1>{post.title}</h1>
        <p className="text-sm text-zinc-500">{post.date}</p>
        <MDXRemote source={post.content} />
      </article>
      <ChatWidget postContext={post.content} />
    </>
  );
}
