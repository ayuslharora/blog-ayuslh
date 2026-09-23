import { SITE_URL } from '../jsonLd';
import { escapeHtml } from './escapeHtml';
import { renderButton, renderLayout } from './layout';

export const UNSUBSCRIBE_PLACEHOLDER = '{{{RESEND_UNSUBSCRIBE_URL}}}';

export type EmailPost = {
  url: string;
  seriesTitle: string;
  subtopic?: string;
  title: string;
  caption: string;
  readingMinutes: number;
};

function renderPostBlock(post: EmailPost, single: boolean, isFirst: boolean): string {
  const url = escapeHtml(post.url);
  const eyebrow = escapeHtml([post.seriesTitle, post.subtopic].filter(Boolean).join(' · '));
  const tail = single
    ? `<tr><td class="t-muted" style="padding:14px 36px 0;font-size:13px;color:#71717a;">${post.readingMinutes} min read</td></tr>
<tr><td style="padding:24px 36px 32px;">${renderButton(post.url, 'Read the post')}</td></tr>`
    : `<tr><td class="t-muted" style="padding:10px 36px 0;font-size:13px;color:#71717a;">${post.readingMinutes} min read &nbsp;·&nbsp; <a class="t-eyebrow" href="${url}" style="color:#b45309;font-weight:700;text-decoration:none;">Read &rarr;</a></td></tr>`;
  return `
<tr><td class="t-eyebrow" style="padding:${isFirst ? 18 : 28}px 36px 0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#b45309;">${eyebrow}</td></tr>
<tr><td style="padding:10px 36px 0;"><a class="t-title" href="${url}" style="font-size:${single ? 26 : 21}px;line-height:1.25;font-weight:800;color:#050505;text-decoration:none;">${escapeHtml(post.title)}</a></td></tr>
<tr><td class="t-body" style="padding:12px 36px 0;font-size:16px;line-height:1.6;color:#3f3f46;">${escapeHtml(post.caption)}</td></tr>
${tail}`;
}

export function renderPostEmail({
  posts,
  preheader,
  overflowCount,
}: {
  posts: EmailPost[];
  preheader: string;
  overflowCount: number;
}): { html: string; text: string } {
  const single = posts.length === 1;
  const blocks = posts.map((p, i) => renderPostBlock(p, single, i === 0)).join('');
  const overflow =
    overflowCount > 0
      ? `<tr><td class="t-muted" style="padding:28px 36px 0;font-size:14px;color:#71717a;">and ${overflowCount} more on <a class="t-eyebrow" href="${SITE_URL}" style="color:#b45309;font-weight:700;text-decoration:none;">blog.ayuslh.in</a></td></tr>`
      : '';
  const spacer = single ? '' : '<tr><td style="padding:0 0 32px;"></td></tr>';
  const footerHtml = `You're getting this because you subscribed at blog.ayuslh.in.<br><a class="t-muted" href="${UNSUBSCRIBE_PLACEHOLDER}" style="color:#71717a;">Unsubscribe</a> &nbsp;·&nbsp; <a class="t-muted" href="${SITE_URL}/feed.xml" style="color:#71717a;">RSS feed</a>`;

  const html = renderLayout({ preheader, content: blocks + overflow + spacer, footerHtml });
  const text = [
    ...posts.map((p) => `${p.title}\n${p.caption}\n${p.readingMinutes} min read: ${p.url}`),
    ...(overflowCount > 0 ? [`and ${overflowCount} more on ${SITE_URL}`] : []),
    `Unsubscribe: ${UNSUBSCRIBE_PLACEHOLDER}`,
  ].join('\n\n');
  return { html, text };
}
