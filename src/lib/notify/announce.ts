import type { Post } from '../posts';

export function isAnnounceable(post: Post): boolean {
  return !post.draft && post.broadcast && typeof post.title === 'string' && post.title.length > 0;
}

const key = (post: Post) => `${post.series}/${post.slug}`;

export function findNewlyLive(before: Post[], after: Post[]): Post[] {
  const wasLive = new Set(before.filter(isAnnounceable).map(key));
  return after.filter((post) => isAnnounceable(post) && !wasLive.has(key(post)));
}
