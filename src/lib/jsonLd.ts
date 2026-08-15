import { execSync } from 'node:child_process';
import type { Post, PostMeta } from './posts';

export const SITE_URL = 'https://blog.ayuslh.in';
export const AUTHOR_URL = 'https://ayuslh.in';
export const AUTHOR_ID = `${AUTHOR_URL}/#person`;

// Same approach as sitemap.ts: real content-change signal instead of
// lying with datePublished. Falls back to the publish date if git isn't
// available (e.g. a shallow clone without history).
function gitLastModified(post: Post | PostMeta, fallback: string): string {
  try {
    const date = execSync(
      `git log -1 --format=%cs -- content/posts/${post.series}/${post.slug}.mdx`,
      { cwd: process.cwd(), encoding: 'utf8' }
    ).trim();
    return date || fallback;
  } catch {
    return fallback;
  }
}

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
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'BITS Pilani',
    },
    knowsAbout: [
      'System Design',
      'Backend Engineering',
      'Computer Networking',
      'Distributed Systems',
    ],
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
  const url = `${SITE_URL}/${post.series}/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: gitLastModified(post, post.date),
    url,
    image: `${url}/opengraph-image`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
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

export function buildSeriesCollectionPageJsonLd(series: string, seriesTitle: string, seriesDescription: string, posts: PostMeta[]) {
  const url = `${SITE_URL}/${series}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}/#collectionpage`,
    url,
    name: seriesTitle,
    description: seriesDescription,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${series}/${post.slug}`,
        name: post.title,
      })),
    },
  };
}

export function buildSeriesIndexItemListJsonLd(seriesList: { slug: string; title: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/series/#collectionpage`,
    url: `${SITE_URL}/series`,
    name: 'Series Catalog',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: seriesList.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${s.slug}`,
        name: s.title,
      })),
    },
  };
}

export function buildSoftwareApplicationJsonLd(opts: { path: string; name: string; description: string }) {
  const url = `${SITE_URL}${opts.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${url}/#softwareapplication`,
    name: opts.name,
    url,
    description: opts.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (browser-based)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: { '@id': AUTHOR_ID },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}

// GEO/LLM-citation aid only, not for Google rich results: Google restricted
// FAQPage rich results to gov/health sites in Aug 2023, but AI systems still
// use FAQPage markup as a citability signal for direct Q&A content.
export function buildFaqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
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
