import { describe, expect, it } from 'vitest';
import { findNewlyLive, isAnnounceable } from '../../src/lib/notify/announce';
import type { Post } from '../../src/lib/posts';

const p = (slug: string, extra: Partial<Post> = {}): Post => ({
  series: 's',
  slug,
  title: `Title ${slug}`,
  description: 'd',
  date: '2026-09-01T10:00:00+05:30',
  tags: [],
  draft: false,
  broadcast: true,
  content: 'body',
  ...extra,
});

describe('isAnnounceable', () => {
  it('requires published, broadcastable, and titled', () => {
    expect(isAnnounceable(p('a'))).toBe(true);
    expect(isAnnounceable(p('a', { draft: true }))).toBe(false);
    expect(isAnnounceable(p('a', { broadcast: false }))).toBe(false);
    expect(isAnnounceable(p('a', { title: undefined as unknown as string }))).toBe(false);
  });
});

describe('findNewlyLive', () => {
  it('announces new posts and draft flips, not edits to live posts', () => {
    const before = [p('live'), p('draft', { draft: true }), p('quiet', { broadcast: false })];
    const after = [p('live', { title: 'Edited' }), p('draft'), p('quiet', { broadcast: false }), p('new')];
    expect(findNewlyLive(before, after).map((x) => x.slug)).toEqual(['draft', 'new']);
  });

  it('announces a post whose broadcast flag flips to true', () => {
    expect(findNewlyLive([p('a', { broadcast: false })], [p('a')]).map((x) => x.slug)).toEqual(['a']);
  });

  it('ignores new drafts, new broadcast:false posts, and removed posts', () => {
    const after = [p('d', { draft: true }), p('q', { broadcast: false })];
    expect(findNewlyLive([p('gone')], after)).toEqual([]);
  });

  it('keys by series and slug', () => {
    expect(findNewlyLive([p('x', { series: 'a' })], [p('x', { series: 'b' })]).map((x) => x.series)).toEqual(['b']);
  });
});
