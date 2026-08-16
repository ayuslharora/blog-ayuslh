import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkMermaid from '../../../lib/remarkMermaid';
import { getAllPosts, getPostBySlug, getPostsBySeries } from '../../../lib/posts';
import { getSeriesTitle } from '../../../lib/covers';
import { getReadingTimeMinutes } from '../../../lib/readingTime';
import { extractH2Headings } from '../../../lib/extractHeadings';
import { getRelatedPosts } from '../../../lib/getRelatedPosts';
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd, serializeJsonLd } from '../../../lib/jsonLd';
import ChatWidget from '../../../components/ChatWidget';
import IpConverter from '../../../components/IpConverter';
import Mermaid from '../../../components/Mermaid';
import TcpHeaderTable from '../../../components/TcpHeaderTable';
import UdpHeaderTable from '../../../components/UdpHeaderTable';
import DnsHeaderTable from '../../../components/DnsHeaderTable';
import Http2FrameHeaderTable from '../../../components/Http2FrameHeaderTable';
import MtuMssDiagram from '../../../components/MtuMssDiagram';
import MnistPca3d from '../../../components/MnistPca3d';
import LinRegCostSurface from '../../../components/LinRegCostSurface';
import GradientDescentAnimation from '../../../components/GradientDescentAnimation';
import GdCostSurface3d from '../../../components/GdCostSurface3d';
import LearningRateExplorer from '../../../components/LearningRateExplorer';
import MultiRegScatter3d from '../../../components/MultiRegScatter3d';
import MultiRegPlane3d from '../../../components/MultiRegPlane3d';
import TableOfContents from '../../../components/TableOfContents';
import RelatedPosts from '../../../components/RelatedPosts';
import MdxImage from '../../../components/MdxImage';
import KatexCopyFix from '../../../components/KatexCopyFix';

// Chapters with this many H2 sections or more get an in-page table of
// contents (currently: ddia-ch1 at 10, ch1-http-request at 6). A count
// threshold rather than hardcoded slugs so future long chapters get one
// automatically.
const TOC_MIN_HEADINGS = 6;

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

  const seriesPosts = getPostsBySeries(series);
  const currentIndex = seriesPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null;

  const headings = extractH2Headings(post.content);
  const relatedPosts = getRelatedPosts(post, getAllPosts());

  return (
    <>
      <article className="w-[90%] md:w-[80%] max-w-none mx-auto px-6 pb-24 pt-8 prose dark:prose-invert prose-headings:font-bold prose-a:text-amber-600 dark:prose-a:text-amber-400 hover:prose-a:text-amber-500 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:px-5 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:shadow-sm prose-img:rounded-2xl prose-img:shadow-xl mt-8 relative">
        <Script
          id="jsonld-blogposting"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBlogPostingJsonLd(post)) }}
        />
        <Script
          id="jsonld-breadcrumb"
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
            <Link href="/about" className="hover:text-amber-500 transition-colors">
              By Ayush Arora
            </Link>
            <span>•</span>
            <time dateTime={post.date.split('T')[0]}>{post.date.split('T')[0]}</time>
            <span>•</span>
            <span>{getReadingTimeMinutes(post.content)} min read</span>
          </div>
        </header>



        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath, remarkMermaid],
              rehypePlugins: [
                rehypeSlug,
                rehypeKatex,
                [rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: false }],
              ],
            },
          }}
          components={{
            IpConverter,
            TcpHeaderTable,
            UdpHeaderTable,
            DnsHeaderTable,
            Http2FrameHeaderTable,
            MtuMssDiagram,
            MnistPca3d,
            LinRegCostSurface,
            GradientDescentAnimation,
            GdCostSurface3d,
            LearningRateExplorer,
            MultiRegScatter3d,
            MultiRegPlane3d,
            Mermaid,
            img: MdxImage,
            MdxImage,
          }}
        />

        <nav className="not-prose mt-16 pt-8 border-t border-black/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <Link
              href={`/${series}/${prevPost.slug}`}
              className="group flex flex-col rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] p-5 transition-colors"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">← Previous</span>
              <span className="font-bold group-hover:text-amber-500 transition-colors">{prevPost.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextPost && (
            <Link
              href={`/${series}/${nextPost.slug}`}
              className="group flex flex-col rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] p-5 transition-colors sm:text-right sm:items-end"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">Next →</span>
              <span className="font-bold group-hover:text-amber-500 transition-colors">{nextPost.title}</span>
            </Link>
          )}
        </nav>

        <RelatedPosts posts={relatedPosts} />

        <div className="not-prose mt-6 text-center">
          <Link
            href={`/${series}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-amber-500 transition-colors"
          >
            View all chapters in {getSeriesTitle(series)} →
          </Link>
        </div>
      </article>
      <KatexCopyFix />
      <ChatWidget postContext={post.content} />
    </>
  );
}
