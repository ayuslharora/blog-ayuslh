import type { MetadataRoute } from 'next';
import { getAllPosts, getAllSeries } from '../lib/posts';

const BASE_URL = 'https://blog.ayuslh.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const series = getAllSeries();

  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/series`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/tools/ip-converter`, changeFrequency: 'monthly', priority: 0.6 },
    ...series.map((s) => ({
      url: `${BASE_URL}/${s}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${BASE_URL}/${post.series}/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
  ];
}
