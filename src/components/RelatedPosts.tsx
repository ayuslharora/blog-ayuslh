import Link from 'next/link';
import type { PostMeta } from '../lib/posts';
import { getSeriesTitle } from '../lib/covers';

export default function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <nav aria-label="Related posts" className="not-prose mt-10 pt-8 border-t border-black/10 dark:border-white/10">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">Related Posts</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={`${post.series}/${post.slug}`}
            href={`/${post.series}/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] p-5 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">
              {getSeriesTitle(post.series)}
            </span>
            <span className="font-bold group-hover:text-amber-500 transition-colors">{post.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
