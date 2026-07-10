import type { Post, PostMeta } from './posts';

export const SITE_URL = 'https://blog.ayuslh.in';
export const AUTHOR_URL = 'https://ayuslh.in';
export const AUTHOR_ID = `${AUTHOR_URL}/#person`;

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function buildPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: 'Ayush Arora',
    url: AUTHOR_URL,
    jobTitle: 'Software Developer',
    sameAs: [
      SITE_URL,
      'https://github.com/ayuslharora',
      'https://linkedin.com/in/ayuslharora',
    ],
  };
}

export function buildProfilePageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}/about/#profilepage`,
    url: `${SITE_URL}/about`,
    mainEntity: { '@id': AUTHOR_ID },
  };
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
    author: { '@id': AUTHOR_ID },
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
    name: 'Ayush Arora',
    alternateName: ['Ayush Arora Blog', 'blog.ayuslh.in'],
    url: SITE_URL,
    description:
      'In-depth notes and write-ups on system design, backend engineering, and computer networking, by Ayush Arora.',
    inLanguage: 'en-IN',
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': AUTHOR_ID },
  };
}
