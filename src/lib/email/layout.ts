import { SITE_URL } from '../jsonLd';
import { escapeHtml } from './escapeHtml';

export const AVATAR_URL = `${SITE_URL}/email/avatar.gif`;

// Keeps inbox apps from pulling body text into the preview after the preheader.
const PREHEADER_PAD = '&#847;&zwnj;&nbsp;'.repeat(60);

// Inline styles are the light theme. Apple Mail / Outlook for Mac use the media query;
// Outlook.com and the Outlook apps mark their dark rewrite with data-ogsc / data-ogsb.
const STYLE = `
:root { color-scheme: light dark; supported-color-schemes: light dark; }
body { margin:0; padding:0; }
@media (prefers-color-scheme: dark) {
  .bg-page { background:#09090b !important; }
  .bg-card { background:#18181b !important; border-color:#27272a !important; }
  .t-title { color:#fafafa !important; }
  .t-body { color:#d4d4d8 !important; }
  .t-muted { color:#a1a1aa !important; }
  .t-eyebrow { color:#fbbf24 !important; }
  .divider, .avatar { border-color:#27272a !important; }
  .btn { background:#fbbf24 !important; background-image:linear-gradient(90deg,#fbbf24,#fde68a) !important; color:#09090b !important; }
}
[data-ogsb] .bg-page { background:#09090b !important; }
[data-ogsb] .bg-card { background:#18181b !important; }
[data-ogsb] .btn { background:#fbbf24 !important; }
[data-ogsc] .t-title { color:#fafafa !important; }
[data-ogsc] .t-body { color:#d4d4d8 !important; }
[data-ogsc] .t-muted { color:#a1a1aa !important; }
[data-ogsc] .t-eyebrow { color:#fbbf24 !important; }
[data-ogsc] .btn { color:#09090b !important; }
`;

export function renderButton(href: string, label: string): string {
  return `<a class="btn" href="${escapeHtml(href)}" style="display:inline-block;background:#09090b;color:#fafafa;font-size:15px;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:999px;">${escapeHtml(label)} &rarr;</a>`;
}

export function renderLayout({
  preheader,
  content,
  footerHtml,
}: {
  preheader: string;
  content: string;
  footerHtml: string;
}): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title></title>
<style>${STYLE}</style>
</head>
<body class="bg-page" style="margin:0;padding:0;background:#fafafa;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}${PREHEADER_PAD}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-page" bgcolor="#fafafa" style="background:#fafafa;">
<tr><td align="center" style="padding:32px 16px 40px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" class="bg-card" bgcolor="#ffffff" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<tr><td style="padding:28px 36px 0;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:12px;"><a href="${SITE_URL}"><img class="avatar" src="${AVATAR_URL}" width="44" height="44" alt="&gt;_" style="display:block;border-radius:10px;border:1px solid #e4e4e7;"></a></td>
<td><a class="t-title" href="${SITE_URL}" style="font-size:15px;font-weight:800;color:#050505;text-decoration:none;">Ayush Arora</a><br><span class="t-muted" style="font-size:13px;color:#71717a;">blog.ayuslh.in</span></td>
</tr></table>
</td></tr>
<tr><td style="padding:24px 36px 0;"><div style="height:3px;width:40px;background:#f59e0b;border-radius:2px;"></div></td></tr>
${content}
<tr><td class="divider t-muted" style="padding:20px 36px 28px;border-top:1px solid #e4e4e7;font-size:12px;line-height:1.6;color:#71717a;">${footerHtml}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
