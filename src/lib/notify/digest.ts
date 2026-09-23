import { getSeriesTitle } from '../covers';
import type { EmailPost } from '../email/postEmail';
import { SITE_URL } from '../jsonLd';
import type { Post } from '../posts';
import { getReadingTimeMinutes } from '../readingTime';

export const MAX_POSTS_IN_EMAIL = 10;

export type Digest = { subject: string; preheader: string; posts: EmailPost[]; overflowCount: number };

// Frontmatter is user-authored YAML: a field can come through as the wrong type (e.g. an
// unquoted number) or an empty override. Treat anything but a non-empty string as absent
// rather than crashing downstream (escapeHtml) or emailing a blank subject/caption.
function textOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function descriptionOf(post: Post): string {
  return typeof post.description === 'string' ? post.description : String(post.description ?? '');
}

function toEmailPost(post: Post): EmailPost {
  return {
    url: `${SITE_URL}/${post.series}/${post.slug}`,
    seriesTitle: getSeriesTitle(post.series),
    title: post.title,
    caption: textOr(post.emailCaption, descriptionOf(post)),
    readingMinutes: getReadingTimeMinutes(post.content),
  };
}

export function buildDigest(newlyLive: Post[]): Digest {
  const sorted = [...newlyLive].sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
  const lead = sorted[0];
  if (!lead) throw new Error('buildDigest needs at least one post');

  const leadSubject = textOr(lead.emailSubject, lead.title);
  const shown = sorted.slice(0, MAX_POSTS_IN_EMAIL);
  return {
    subject: sorted.length === 1 ? leadSubject : `${leadSubject} (+${sorted.length - 1} more)`,
    preheader: textOr(lead.emailCaption, descriptionOf(lead)),
    posts: shown.map(toEmailPost),
    overflowCount: sorted.length - shown.length,
  };
}
