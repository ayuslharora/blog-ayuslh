import { describe, expect, it } from 'vitest';
import { buildDigest, MAX_POSTS_IN_EMAIL } from '../../src/lib/notify/digest';
import type { Post } from '../../src/lib/posts';

const p = (n: number, extra: Partial<Post> = {}): Post => ({
  series: 'machine-learning-algorithms',
  slug: `post-${n}`,
  title: `Post ${n}`,
  description: `Description ${n}`,
  date: `2026-09-${String(n).padStart(2, '0')}T10:00:00+05:30`,
  tags: [],
  draft: false,
  broadcast: true,
  subtopic: 'Ensemble Learning',
  content: 'word '.repeat(1356),
  ...extra,
});

describe('buildDigest', () => {
  it('uses the title and description for a single post', () => {
    const d = buildDigest([p(5)]);
    expect(d.subject).toBe('Post 5');
    expect(d.preheader).toBe('Description 5');
    expect(d.overflowCount).toBe(0);
    expect(d.posts).toEqual([
      {
        url: 'https://blog.ayuslh.in/machine-learning-algorithms/post-5',
        seriesTitle: 'Machine Learning Algorithms',
        title: 'Post 5',
        caption: 'Description 5',
        readingMinutes: 7,
      },
    ]);
  });

  it('prefers emailSubject and emailCaption, and keeps special characters raw', () => {
    const d = buildDigest([p(1, { emailSubject: 'Q&A: <T> generics', emailCaption: 'Short & sweet' })]);
    expect(d.subject).toBe('Q&A: <T> generics');
    expect(d.preheader).toBe('Short & sweet');
    expect(d.posts[0].caption).toBe('Short & sweet');
  });

  it('leads with the newest post and counts the rest in the subject', () => {
    const d = buildDigest([p(3), p(9), p(5)]);
    expect(d.subject).toBe('Post 9 (+2 more)');
    expect(d.posts.map((x) => x.title)).toEqual(['Post 9', 'Post 5', 'Post 3']);
  });

  it('caps the list at 10 and reports the overflow', () => {
    const posts = Array.from({ length: 12 }, (_, i) => p(i + 1));
    const d = buildDigest(posts);
    expect(d.posts).toHaveLength(MAX_POSTS_IN_EMAIL);
    expect(d.overflowCount).toBe(2);
    expect(d.subject).toBe('Post 12 (+11 more)');
  });

  it('throws on an empty list', () => {
    expect(() => buildDigest([])).toThrow();
  });

  it('stringifies a non-string description instead of crashing', () => {
    const d = buildDigest([p(1, { description: 42 as unknown as string })]);
    expect(d.preheader).toBe('42');
    expect(d.posts[0].caption).toBe('42');
  });

  it('falls back to title/description when emailSubject or emailCaption is an empty string', () => {
    const d = buildDigest([p(1, { emailSubject: '', emailCaption: '' })]);
    expect(d.subject).toBe('Post 1');
    expect(d.preheader).toBe('Description 1');
    expect(d.posts[0].caption).toBe('Description 1');
  });
});
