import { describe, expect, it } from 'vitest';
import path from 'node:path';
import {
  getAllPosts,
  getAllSeries,
  getAllTags,
  getPostBySlug,
  getPostsBySeries,
  getPostsByTag,
} from '../../src/lib/posts';

const FIXTURES = path.join(__dirname, '../fixtures/content/posts');

describe('getAllPosts', () => {
  it('excludes drafts and sorts by date descending', () => {
    const posts = getAllPosts(FIXTURES);
    expect(posts.map((p) => p.slug)).toEqual([
      'ch1-only-post',
      'ch2-second-post',
      'ch1-first-post',
    ]);
  });
});

describe('getPostsBySeries', () => {
  it('returns only that series, sorted by slug ascending, drafts excluded', () => {
    const posts = getPostsBySeries('seriesa', FIXTURES);
    expect(posts.map((p) => p.slug)).toEqual(['ch1-first-post', 'ch2-second-post']);
  });

  it('returns an empty array for a series with only a draft', () => {
    const posts = getPostsBySeries('nonexistent', FIXTURES);
    expect(posts).toEqual([]);
  });
});

describe('getPostBySlug', () => {
  it('returns the full post including content', () => {
    const post = getPostBySlug('seriesa', 'ch1-first-post', FIXTURES);
    expect(post).not.toBeNull();
    expect(post?.title).toBe('Series A Chapter 1');
    expect(post?.content).toBe('Body content for chapter 1.');
  });

  it('returns null for a draft post even when queried directly', () => {
    const post = getPostBySlug('seriesa', 'ch3-draft-post', FIXTURES);
    expect(post).toBeNull();
  });

  it('returns null for a nonexistent post', () => {
    const post = getPostBySlug('seriesa', 'does-not-exist', FIXTURES);
    expect(post).toBeNull();
  });
});

describe('getAllSeries', () => {
  it('returns unique series names sorted alphabetically', () => {
    expect(getAllSeries(FIXTURES)).toEqual(['seriesa', 'seriesb']);
  });
});

describe('getAllTags', () => {
  it('returns unique tags from non-draft posts only, sorted alphabetically', () => {
    expect(getAllTags(FIXTURES)).toEqual(['series-a', 'series-b', 'testing']);
  });
});

describe('getPostsByTag', () => {
  it('returns matching posts sorted by date descending', () => {
    const posts = getPostsByTag('testing', FIXTURES);
    expect(posts.map((p) => p.slug)).toEqual([
      'ch1-only-post',
      'ch2-second-post',
      'ch1-first-post',
    ]);
  });
});
