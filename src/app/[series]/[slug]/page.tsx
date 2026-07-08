import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPostBySlug } from '../../../lib/posts';
import { getSeriesTitle } from '../../../lib/covers';
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
      <article className="w-[90%] md:w-[80%] max-w-none mx-auto px-6 pb-24 pt-8 prose dark:prose-invert prose-headings:font-bold prose-a:text-amber-600 dark:prose-a:text-amber-400 hover:prose-a:text-amber-500 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:px-5 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:shadow-sm prose-img:rounded-2xl prose-img:shadow-xl mt-8 relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBlogPostingJsonLd(post)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBreadcrumbJsonLd(post)) }}
        />
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <header className="mb-14">
          <Link
            href={`/${series}`}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-widest mb-6 transition-colors hover:bg-amber-500/20"
          >
            {getSeriesTitle(series)}
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 !leading-[1.1] tracking-tight text-gradient-gold">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] font-medium">
            <time dateTime={post.date}>{post.date}</time>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </header>

        <MDXRemote source={post.content} />
      </article>
      <ChatWidget postContext={post.content} />
    </>
  );
}
