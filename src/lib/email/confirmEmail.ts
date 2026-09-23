import { renderButton, renderLayout } from './layout';

export const CONFIRM_SUBJECT = "Confirm your subscription to Ayush Arora's blog";

export function renderConfirmEmail(confirmUrl: string): { html: string; text: string } {
  const content = `
<tr><td style="padding:18px 36px 0;"><span class="t-title" style="font-size:24px;line-height:1.3;font-weight:800;color:#050505;">Confirm your subscription</span></td></tr>
<tr><td class="t-body" style="padding:12px 36px 0;font-size:16px;line-height:1.6;color:#3f3f46;">Click below to get an email whenever a new post goes up on blog.ayuslh.in. The link works for 48 hours.</td></tr>
<tr><td style="padding:24px 36px 32px;">${renderButton(confirmUrl, 'Confirm subscription')}</td></tr>`;
  const html = renderLayout({
    preheader: 'One click to start getting new posts by email.',
    content,
    footerHtml: "If you didn't ask for this, ignore this email and you won't be subscribed.",
  });
  const text = `Confirm your subscription to blog.ayuslh.in:\n${confirmUrl}\n\nThe link works for 48 hours. If you didn't ask for this, ignore this email.`;
  return { html, text };
}
