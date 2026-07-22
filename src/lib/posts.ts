import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type PostSource = {
  title?: string;
  channel?: string;
  url?: string;
};

export type PostMeta = {
  series: string;
  slug: string;
  title: string;
  description: string;
  summary?: string;
  date: string;
  tags: string[];
  draft: boolean;
  source?: PostSource;
};

export type Post = PostMeta & { content: string };

const DEFAULT_CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');

type RawFile = { series: string; slug: string; raw: string };

function readAllPostFiles(baseDir: string): RawFile[] {
  if (!fs.existsSync(baseDir)) return [];
  const seriesDirs = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  const files: RawFile[] = [];
  for (const seriesDir of seriesDirs) {
    const seriesPath = path.join(baseDir, seriesDir.name);
    const postFiles = fs.readdirSync(seriesPath).filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));
    for (const file of postFiles) {
      const raw = fs.readFileSync(path.join(seriesPath, file), 'utf8');
      files.push({ series: seriesDir.name, slug: file.replace(/\.mdx$/, ''), raw });
    }
  }
  return files;
}

function parsePost(series: string, slug: string, raw: string): Post {
  // gray-matter only recognizes frontmatter if `---` is the file's literal
  // first line - a leading blank line (e.g. from an editor's auto-format)
  // silently makes it return no frontmatter at all.
  const { data, content } = matter(raw.trimStart());
  const summaryOrDesc = data.summary ?? data.description ?? '';

  return {
    series,
    slug,
    title: data.title,
    description: summaryOrDesc,
    summary: summaryOrDesc,
    date: data.date,
    tags: data.tags ?? [],
    draft: data.draft ?? false,
    source: data.source ?? undefined,
    content: content.trim(),
  };
}

export function getAllPosts(baseDir: string = DEFAULT_CONTENT_DIR): PostMeta[] {
  return readAllPostFiles(baseDir)
    .map(({ series, slug, raw }) => parsePost(series, slug, raw))
    .filter((post) => !post.draft)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      // If dates are equal, sort alphabetically by series, then slug (descending natural sort)
      const seriesCompare = b.series.localeCompare(a.series);
      if (seriesCompare !== 0) return seriesCompare;
      return b.slug.localeCompare(a.slug, undefined, { numeric: true, sensitivity: 'base' });
    })
    .map(({ content: _content, ...meta }) => meta);
}

export function getPostsBySeries(series: string, baseDir: string = DEFAULT_CONTENT_DIR): PostMeta[] {
  return readAllPostFiles(baseDir)
    .filter((file) => file.series === series)
    .map(({ series: s, slug, raw }) => parsePost(s, slug, raw))
    .filter((post) => !post.draft)
    .sort((a, b) => a.slug.localeCompare(b.slug, undefined, { numeric: true, sensitivity: 'base' }))
    .map(({ content: _content, ...meta }) => meta);
}

export function getPostBySlug(
  series: string,
  slug: string,
  baseDir: string = DEFAULT_CONTENT_DIR
): Post | null {
  const file = readAllPostFiles(baseDir).find((f) => f.series === series && f.slug === slug);
  if (!file) return null;
  const post = parsePost(file.series, file.slug, file.raw);
  return post.draft ? null : post;
}

export function getAllSeries(baseDir: string = DEFAULT_CONTENT_DIR): string[] {
  const series = new Set(getAllPosts(baseDir).map((post) => post.series));
  return Array.from(series).sort();
}

/**
 * Get all TIL posts sorted in reverse chronological order
 */
export function getTilPosts(baseDir: string = DEFAULT_CONTENT_DIR): PostMeta[] {
  return getAllPosts(baseDir).filter((post) => post.series === 'til');
}

/**
 * Get a single TIL post by its slug
 */
export function getTilPostBySlug(slug: string, baseDir: string = DEFAULT_CONTENT_DIR): Post | null {
  return getPostBySlug('til', slug, baseDir);
}

/**
 * Get all unique tags used across all TIL posts
 */
export function getAllTilTags(baseDir: string = DEFAULT_CONTENT_DIR): string[] {
  const tagsSet = new Set<string>();
  getTilPosts(baseDir).forEach((post) => {
    post.tags.forEach((tag) => tagsSet.add(tag.toLowerCase().trim()));
  });
  return Array.from(tagsSet).sort();
}
