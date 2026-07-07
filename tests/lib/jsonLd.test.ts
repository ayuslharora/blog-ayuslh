import { describe, expect, it } from 'vitest';
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildWebsiteJsonLd,
  serializeJsonLd,
} from '../../src/lib/jsonLd';
import type { PostMeta } from '../../src/lib/posts';

const post: PostMeta = {
  series: 'ddia',
  slug: 'ch1-reliable-scalable-maintainable',
  title: 'DDIA Ch.1',
  description: 'Notes on chapter 1',
  date: '2026-07-08',
  tags: ['system-design'],
  draft: false,
};

describe('serializeJsonLd', () => {
  it('escapes < to prevent script injection when embedded in HTML', () => {
    expect(serializeJsonLd({ a: '</script><script>' })).not.toContain('</script>');
  });
});

describe('buildBlogPostingJsonLd', () => {
  it('builds a BlogPosting schema with the post URL', () => {
    const schema = buildBlogPostingJsonLd(post);
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.headline).toBe('DDIA Ch.1');
    expect(schema.url).toBe('https://blog.ayuslh.in/ddia/ch1-reliable-scalable-maintainable');
    expect(schema.datePublished).toBe('2026-07-08');
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('builds a 3-level breadcrumb: Home -> Series -> Post', () => {
    const schema = buildBreadcrumbJsonLd(post);
    expect(schema['@type']).toBe('BreadcrumbList');
    const items = schema.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[1].item).toBe('https://blog.ayuslh.in/ddia');
    expect(items[2].item).toBe('https://blog.ayuslh.in/ddia/ch1-reliable-scalable-maintainable');
  });
});

describe('buildWebsiteJsonLd', () => {
  it('builds a WebSite schema for the blog', () => {
    const schema = buildWebsiteJsonLd();
    expect(schema['@type']).toBe('WebSite');
    expect(schema.url).toBe('https://blog.ayuslh.in');
  });
});
