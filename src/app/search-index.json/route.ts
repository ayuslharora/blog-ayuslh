import { getAllPosts } from '../../lib/posts';
import type { SearchEntry } from '../../lib/searchIndex';

export async function GET() {
  const entries: SearchEntry[] = getAllPosts().map(({ title, description, series, slug, tags }) => ({
    title,
    description,
    series,
    slug,
    tags,
  }));

  return Response.json(entries);
}
