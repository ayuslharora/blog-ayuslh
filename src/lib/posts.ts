import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type PostMeta = {
  series: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft: boolean;
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
    const postFiles = fs.readdirSync(seriesPath).filter((f) => f.endsWith('.mdx'));
    for (const file of postFiles) {
      const raw = fs.readFileSync(path.join(seriesPath, file), 'utf8');
      files.push({ series: seriesDir.name, slug: file.replace(/\.mdx$/, ''), raw });
    }
  }
  return files;
}

function parsePost(series: string, slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  return {
    series,
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    tags: data.tags ?? [],
    draft: data.draft ?? false,
    content: content.trim(),
  };
}

export function getAllPosts(baseDir: string = DEFAULT_CONTENT_DIR): PostMeta[] {
  return readAllPostFiles(baseDir)
    .map(({ series, slug, raw }) => parsePost(series, slug, raw))
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ content: _content, ...meta }) => meta);
}

export function getPostsBySeries(series: string, baseDir: string = DEFAULT_CONTENT_DIR): PostMeta[] {
  return readAllPostFiles(baseDir)
    .filter((file) => file.series === series)
    .map(({ series: s, slug, raw }) => parsePost(s, slug, raw))
    .filter((post) => !post.draft)
    .sort((a, b) => (a.slug < b.slug ? -1 : 1))
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

export function getAllTags(baseDir: string = DEFAULT_CONTENT_DIR): string[] {
  const tags = new Set(getAllPosts(baseDir).flatMap((post) => post.tags));
  return Array.from(tags).sort();
}

export function getPostsByTag(tag: string, baseDir: string = DEFAULT_CONTENT_DIR): PostMeta[] {
  return getAllPosts(baseDir).filter((post) => post.tags.includes(tag));
}
