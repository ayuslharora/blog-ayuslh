import type { Post, PostMeta } from './posts';

export const SITE_URL = 'https://blog.ayuslh.in';

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function buildBlogPostingJsonLd(post: Post | PostMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: `${SITE_URL}/${post.series}/${post.slug}`,
    author: {
      '@type': 'Person',
      name: 'Ayush Arora',
      url: 'https://ayuslh.in',
    },
  };
}

export function buildBreadcrumbJsonLd(post: PostMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: post.series, item: `${SITE_URL}/${post.series}` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/${post.series}/${post.slug}`,
      },
    ],
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'blog.ayuslh.in',
    url: SITE_URL,
    description: "Ayush Arora's learning notes and write-ups.",
    inLanguage: 'en-IN',
  };
}
