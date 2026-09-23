import { getSeriesTitle } from '../covers';
import type { EmailPost } from '../email/postEmail';
import { SITE_URL } from '../jsonLd';
import type { Post } from '../posts';
import { getReadingTimeMinutes } from '../readingTime';

export const MAX_POSTS_IN_EMAIL = 10;

export type Digest = { subject: string; preheader: string; posts: EmailPost[]; overflowCount: number };

function toEmailPost(post: Post): EmailPost {
  return {
    url: `${SITE_URL}/${post.series}/${post.slug}`,
    seriesTitle: getSeriesTitle(post.series),
    subtopic: post.subtopic,
    title: post.title,
    caption: post.emailCaption ?? post.description,
    readingMinutes: getReadingTimeMinutes(post.content),
  };
}

export function buildDigest(newlyLive: Post[]): Digest {
  const sorted = [...newlyLive].sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
  const lead = sorted[0];
  if (!lead) throw new Error('buildDigest needs at least one post');

  const leadSubject = lead.emailSubject ?? lead.title;
  const shown = sorted.slice(0, MAX_POSTS_IN_EMAIL);
  return {
    subject: sorted.length === 1 ? leadSubject : `${leadSubject} (+${sorted.length - 1} more)`,
    preheader: lead.emailCaption ?? lead.description,
    posts: shown.map(toEmailPost),
    overflowCount: sorted.length - shown.length,
  };
}
