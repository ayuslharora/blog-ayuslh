import { SITE_URL } from '../../../lib/jsonLd';
import { checkRateLimit, type RateLimitEntry } from '../../../lib/rateLimit';
import { createResendClient } from '../../../lib/resend';
import { handleSubscribe } from '../../../lib/subscribe/handlers';
import { verifyTurnstile } from '../../../lib/turnstile';

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60_000;
const rateLimitStore = new Map<string, RateLimitEntry>();

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
  if (!checkRateLimit(rateLimitStore, ip ?? 'unknown', RATE_LIMIT, WINDOW_MS, Date.now())) {
    return Response.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }

  const { RESEND_API_KEY, TURNSTILE_SECRET_KEY, SUBSCRIBE_TOKEN_SECRET } = process.env;
  if (!RESEND_API_KEY || !TURNSTILE_SECRET_KEY || !SUBSCRIBE_TOKEN_SECRET) {
    return Response.json({ error: 'Subscriptions are not configured.' }, { status: 500 });
  }

  const resend = createResendClient(RESEND_API_KEY);
  const result = await handleSubscribe(await request.json().catch(() => null), {
    verifyTurnstile: (token) => verifyTurnstile(token, TURNSTILE_SECRET_KEY, ip),
    sendEmail: resend.sendEmail,
    tokenSecret: SUBSCRIBE_TOKEN_SECRET,
    nowSeconds: () => Math.floor(Date.now() / 1000),
    // Production links always use the canonical domain; locally they point back at the dev server.
    siteUrl: process.env.NODE_ENV === 'production' ? SITE_URL : new URL(request.url).origin,
  });
  return Response.json(result.body, { status: result.status });
}
