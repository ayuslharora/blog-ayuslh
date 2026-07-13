import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { getAllPosts, getAllSeries, getPostBySlug, getPostsBySeries } from '../../src/lib/posts';

const FIXTURES = path.join(__dirname, '../fixtures/content/posts');

describe('getAllPosts', () => {
  it('excludes drafts and sorts by date descending', () => {
    const posts = getAllPosts(FIXTURES);
    expect(posts.map((p) => p.slug)).toEqual([
      'ch4-leading-blank-line',
      'ch1-only-post',
      'ch2-second-post',
      'ch1-first-post',
    ]);
  });

  it('parses title and description even with a leading blank line before the frontmatter delimiter', () => {
    const posts = getAllPosts(FIXTURES);
    const post = posts.find((p) => p.slug === 'ch4-leading-blank-line');
    expect(post?.title).toBe('Leading Blank Line Post');
    expect(post?.description).toBe('Should still parse correctly despite a leading blank line');
    expect(post?.date).toBe('2026-01-25');
  });
});

describe('getPostsBySeries', () => {
  it('returns only that series, sorted by slug ascending, drafts excluded', () => {
    const posts = getPostsBySeries('seriesa', FIXTURES);
    expect(posts.map((p) => p.slug)).toEqual([
      'ch1-first-post',
      'ch2-second-post',
      'ch4-leading-blank-line',
    ]);
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

