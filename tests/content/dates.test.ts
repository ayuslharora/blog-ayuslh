import { describe, expect, it } from 'vitest';
import { getAllPosts } from '../../src/lib/posts';

// Post dates are compared as raw strings for sorting (see getAllPosts), so
// every post must use the same full-precision format or "latest" ordering
// silently breaks when two same-day posts use different levels of precision.
const FULL_ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

describe('post dates', () => {
  it('all use the full YYYY-MM-DDTHH:MM:SS+05:30 format', () => {
    const offenders = getAllPosts()
      .filter((post) => !FULL_ISO_WITH_OFFSET.test(post.date))
      .map((post) => `${post.series}/${post.slug}: "${post.date}"`);

    expect(offenders).toEqual([]);
  });
});
