import type { MetadataRoute } from 'next';
import { execSync } from 'node:child_process';
import { getAllPosts, getAllSeries } from '../lib/posts';

const BASE_URL = 'https://blog.ayuslh.in';

// Real content-change signal for static/hub pages (Google ignores
// priority/changeFrequency, but lastmod is a genuine freshness signal).
// Falls back to undefined if git isn't available (e.g. a shallow clone
// without history) rather than lying with an always-"today" date.
function gitLastModified(relativePath: string): string | undefined {
  try {
    const date = execSync(`git log -1 --format=%cs -- ${relativePath}`, {
      cwd: process.cwd(),
      encoding: 'utf8',
    }).trim();
    return date || undefined;
  } catch {
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const series = getAllSeries();

  return [
    { url: BASE_URL, lastModified: gitLastModified('src/app/page.tsx') },
    { url: `${BASE_URL}/series`, lastModified: gitLastModified('src/app/series/page.tsx') },
    { url: `${BASE_URL}/about`, lastModified: gitLastModified('src/app/about/page.tsx') },
    {
      url: `${BASE_URL}/tools/ip-converter`,
      lastModified: gitLastModified('src/app/tools/ip-converter/page.tsx'),
    },
    ...series.map((s) => {
      const seriesPosts = posts.filter((p) => p.series === s);
      const mostRecent = seriesPosts.reduce(
        (latest, p) => (p.date > latest ? p.date : latest),
        seriesPosts[0]?.date
      );
      return { url: `${BASE_URL}/${s}`, lastModified: mostRecent };
    }),
    ...posts.map((post) => ({
      url: `${BASE_URL}/${post.series}/${post.slug}`,
      lastModified: post.date,
    })),
  ];
}
