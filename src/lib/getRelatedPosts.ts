import type { PostMeta } from './posts';

// Scores every other post by number of shared tags (frontmatter data that
// already exists and is exposed in search-index.json/llms.txt, but wasn't
// used to power any on-site related-content UI). Ties broken by recency.
// Returns [] rather than falling back to unrelated posts when nothing
// shares a tag, so this only ever surfaces genuinely relevant content.
export function getRelatedPosts(current: PostMeta, allPosts: PostMeta[], limit = 3): PostMeta[] {
  const currentTags = new Set(current.tags);

  return allPosts
    .filter((p) => !(p.series === current.series && p.slug === current.slug))
    .map((post) => ({
      post,
      sharedTags: post.tags.filter((t) => currentTags.has(t)).length,
    }))
    .filter(({ sharedTags }) => sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map(({ post }) => post);
}
