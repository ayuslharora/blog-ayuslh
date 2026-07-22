'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PostMeta } from '../lib/posts';
import { STARTER_TAGS, getTagMeta } from '../lib/tags';

export default function TilFeed({ posts }: { posts: PostMeta[] }) {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Compute all available tags from taxonomy + posts
  const availableTags = useMemo(() => {
    const postTagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags.forEach((t) => postTagSet.add(t.toLowerCase().trim()));
    });

    const starterKeys = Object.keys(STARTER_TAGS);
    const combined = Array.from(new Set([...starterKeys, ...Array.from(postTagSet)]));
    return combined;
  }, [posts]);

  // Filter posts based on selectedTag
  const filteredPosts = useMemo(() => {
    if (selectedTag === 'all') return posts;
    return posts.filter((post) =>
      post.tags.map((t) => t.toLowerCase().trim()).includes(selectedTag)
    );
  }, [posts, selectedTag]);

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-10 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            selectedTag === 'all'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 scale-105'
              : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
          }`}
        >
          All Notes ({posts.length})
        </button>

        {availableTags.map((tagSlug) => {
          const meta = getTagMeta(tagSlug);
          const isSelected = selectedTag === tagSlug;
          const count = posts.filter((p) =>
            p.tags.map((t) => t.toLowerCase().trim()).includes(tagSlug)
          ).length;

          return (
            <button
              key={tagSlug}
              onClick={() => setSelectedTag(tagSlug)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
              }`}
            >
              <span>{meta.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-black/20 text-black font-extrabold'
                      : 'bg-black/10 dark:bg-white/10 text-[var(--text-secondary)]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-black/10 dark:border-white/10">
          <p className="text-lg text-[var(--text-secondary)] font-medium">
            No notes found for tag &quot;{getTagMeta(selectedTag).name}&quot;.
          </p>
          <button
            onClick={() => setSelectedTag('all')}
            className="mt-4 text-sm font-bold text-amber-500 hover:underline"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <article
                key={post.slug}
                className="group relative block p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <time dateTime={post.date} className="text-xs font-semibold text-amber-500 tracking-wider uppercase">
                      {formattedDate}
                    </time>
                    {post.source?.channel && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]">
                        <svg className="w-3.5 h-3.5 text-red-500 inline-block" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span>{post.source.channel}</span>
                      </span>
                    )}
                  </div>
                </div>

                <Link href={`/til/${post.slug}`} className="block group-hover:text-amber-500 transition-colors">
                  <h2 className="text-2xl font-bold mb-3 tracking-tight text-[var(--text-primary)]">
                    {post.title}
                  </h2>
                </Link>

                {post.summary && (
                  <p className="text-base text-[var(--text-secondary)] font-normal mb-4 leading-relaxed line-clamp-2">
                    {post.summary}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                  {post.tags.map((tag) => {
                    const tagMeta = getTagMeta(tag);
                    return (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]"
                      >
                        #{tagMeta.slug}
                      </span>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
