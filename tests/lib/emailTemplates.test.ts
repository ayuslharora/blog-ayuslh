import { describe, expect, it } from 'vitest';
import { renderPostEmail, UNSUBSCRIBE_PLACEHOLDER, type EmailPost } from '../../src/lib/email/postEmail';
import { CONFIRM_SUBJECT, renderConfirmEmail } from '../../src/lib/email/confirmEmail';
import { escapeHtml } from '../../src/lib/email/escapeHtml';

const post = (n: number, extra: Partial<EmailPost> = {}): EmailPost => ({
  url: `https://blog.ayuslh.in/series/post-${n}`,
  seriesTitle: 'Machine Learning Algorithms',
  subtopic: 'Ensemble Learning',
  title: `Post ${n}`,
  caption: `Caption ${n}`,
  readingMinutes: 7,
  ...extra,
});

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x">Q&A 'y'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Q&amp;A &#39;y&#39;&lt;/a&gt;');
  });
});

describe('renderPostEmail', () => {
  it('renders a single post with button, reading time, preheader, avatar, and unsubscribe link', () => {
    const { html, text } = renderPostEmail({ posts: [post(1)], preheader: 'Short inbox line', overflowCount: 0 });
    expect(html).toContain('Read the post');
    expect(html).toContain('7 min read');
    expect(html).toContain('Machine Learning Algorithms · Ensemble Learning');
    expect(html).toContain('href="https://blog.ayuslh.in/series/post-1"');
    expect(html).toContain('Short inbox line');
    expect(html).toContain('https://blog.ayuslh.in/email/avatar.gif');
    expect(html).toContain(UNSUBSCRIBE_PLACEHOLDER);
    expect(text).toContain('Post 1');
    expect(text).toContain(UNSUBSCRIBE_PLACEHOLDER);
  });

  it('uses light inline styles with dark-mode overrides', () => {
    const { html } = renderPostEmail({ posts: [post(1)], preheader: 'p', overflowCount: 0 });
    expect(html).toContain('<meta name="color-scheme" content="light dark">');
    expect(html).toContain('@media (prefers-color-scheme: dark)');
    expect(html).toContain('[data-ogsc]');
    expect(html).toContain('background:#fafafa');
  });

  it('escapes titles and captions in HTML but keeps them raw in plain text', () => {
    const { html, text } = renderPostEmail({
      posts: [post(1, { title: 'Q&A: <T> generics', caption: 'Say "hi" & <b>' })],
      preheader: 'p',
      overflowCount: 0,
    });
    expect(html).toContain('Q&amp;A: &lt;T&gt; generics');
    expect(html).toContain('Say &quot;hi&quot; &amp; &lt;b&gt;');
    expect(html).not.toContain('<T>');
    expect(text).toContain('Q&A: <T> generics');
  });

  it('renders several posts with a Read link each and no big button', () => {
    const { html } = renderPostEmail({ posts: [post(1), post(2), post(3)], preheader: 'p', overflowCount: 0 });
    expect(html.match(/Read &rarr;/g)).toHaveLength(3);
    expect(html).not.toContain('Read the post');
  });

  it('adds an overflow line when posts were cut', () => {
    const { html, text } = renderPostEmail({ posts: [post(1), post(2)], preheader: 'p', overflowCount: 17 });
    expect(html).toContain('and 17 more on');
    expect(text).toContain('and 17 more on https://blog.ayuslh.in');
  });
});

describe('renderConfirmEmail', () => {
  it('links to the confirm URL and has no unsubscribe placeholder', () => {
    const url = 'https://blog.ayuslh.in/subscribe/confirm?token=abc.def';
    const { html, text } = renderConfirmEmail(url);
    expect(CONFIRM_SUBJECT).toBe("Confirm your subscription to Ayush Arora's blog");
    expect(html).toContain(`href="${url}"`);
    expect(html).toContain('Confirm subscription');
    expect(html).not.toContain(UNSUBSCRIBE_PLACEHOLDER);
    expect(text).toContain(url);
  });
});
