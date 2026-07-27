import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import { getTilPosts, getTilPostBySlug } from '../../../lib/posts';
import { getTagMeta } from '../../../lib/tags';
import { getReadingTimeMinutes } from '../../../lib/readingTime';
import { buildBlogPostingJsonLd, serializeJsonLd } from '../../../lib/jsonLd';
import ChatWidget from '../../../components/ChatWidget';
import IpConverter from '../../../components/IpConverter';
import Mermaid from '../../../components/Mermaid';

export const dynamicParams = false;

export function generateStaticParams() {
  return getTilPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getTilPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary || post.description,
    alternates: { canonical: `/til/${slug}` },
    openGraph: {
      title: post.title,
      description: post.summary || post.description,
      url: `/til/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || post.description,
    },
  };
}

export default async function TilPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getTilPostBySlug(slug);
  if (!post) notFound();

  const allTilPosts = getTilPosts();
  const currentIndex = allTilPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allTilPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allTilPosts.length - 1 ? allTilPosts[currentIndex + 1] : null;

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <article className="w-[90%] md:w-[80%] max-w-none mx-auto px-6 pb-24 pt-8 prose dark:prose-invert prose-headings:font-bold prose-a:text-amber-600 dark:prose-a:text-amber-400 hover:prose-a:text-amber-500 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:px-5 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:shadow-sm prose-img:rounded-2xl prose-img:shadow-xl mt-8 relative">
        <Script
          id="jsonld-til-blogposting"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBlogPostingJsonLd(post)) }}
        />

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <header className="mb-12">
          <Link
            href="/til"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-6 transition-all hover:bg-amber-500/20 hover:-translate-x-0.5"
          >
            ← Today I Learned
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 !leading-[1.15] tracking-tight text-gradient-gold">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)] font-medium mb-6">
            <Link href="/about" className="hover:text-amber-500 transition-colors">
              By Ayush Arora
            </Link>
            <span>•</span>
            <time dateTime={post.date}>{formattedDate}</time>
            <span>•</span>
            <span>{getReadingTimeMinutes(post.content)} min read</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8 not-prose">
            {post.tags.map((tag) => {
              const meta = getTagMeta(tag);
              return (
                <span
                  key={tag}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] border border-black/5 dark:border-white/5"
                >
                  #{meta.slug}
                </span>
              );
            })}
          </div>


        </header>

        <MDXRemote
          source={post.content}
          options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
          components={{
            IpConverter,
            pre: (props: any) => {
              const child = props.children;
              if (child && child.type === 'code' && child.props.className === 'language-mermaid') {
                return <Mermaid chart={child.props.children} />;
              }
              return <pre {...props} />;
            },
          }}
        />

        <nav className="not-prose mt-16 pt-8 border-t border-black/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <Link
              href={`/til/${prevPost.slug}`}
              className="group flex flex-col rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] p-5 transition-colors"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">← Newer Note</span>
              <span className="font-bold group-hover:text-amber-500 transition-colors">{prevPost.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextPost && (
            <Link
              href={`/til/${nextPost.slug}`}
              className="group flex flex-col rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] p-5 transition-colors sm:text-right sm:items-end"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">Older Note →</span>
              <span className="font-bold group-hover:text-amber-500 transition-colors">{nextPost.title}</span>
            </Link>
          )}
        </nav>

        <div className="not-prose mt-6 text-center">
          <Link
            href="/til"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-amber-500 transition-colors"
          >
            Browse all Today I Learned notes →
          </Link>
        </div>
      </article>
      <ChatWidget postContext={post.content} />
    </>
  );
}
