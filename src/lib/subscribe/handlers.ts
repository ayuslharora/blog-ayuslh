import { CONFIRM_SUBJECT, renderConfirmEmail } from '../email/confirmEmail';
import { normalizeEmail } from '../email/normalizeEmail';
import { createToken, verifyToken } from '../subscribeToken';

export type HandlerResult = { status: number; body: Record<string, unknown> };

export type SubscribeDeps = {
  verifyTurnstile: (token: string) => Promise<boolean>;
  sendEmail: (m: { to: string; subject: string; html: string; text: string }) => Promise<unknown>;
  tokenSecret: string;
  nowSeconds: () => number;
  siteUrl: string;
};

export async function handleSubscribe(body: unknown, deps: SubscribeDeps): Promise<HandlerResult> {
  const { email: rawEmail, company, turnstileToken } = (body ?? {}) as Record<string, unknown>;

  if (typeof company === 'string' && company.length > 0) return { status: 200, body: { ok: true } };

  const email = normalizeEmail(rawEmail);
  if (!email) return { status: 400, body: { error: 'Please enter a valid email address.' } };

  if (typeof turnstileToken !== 'string' || !(await deps.verifyTurnstile(turnstileToken))) {
    return { status: 400, body: { error: 'Spam check failed. Please reload the page and try again.' } };
  }

  const token = createToken(email, deps.tokenSecret, deps.nowSeconds());
  const { html, text } = renderConfirmEmail(`${deps.siteUrl}/subscribe/confirm?token=${encodeURIComponent(token)}`);
  try {
    await deps.sendEmail({ to: email, subject: CONFIRM_SUBJECT, html, text });
  } catch {
    return { status: 502, body: { error: "Couldn't send the confirmation email. Please try again later." } };
  }
  return { status: 200, body: { ok: true } };
}

export type ConfirmDeps = {
  upsertContact: (email: string) => Promise<void>;
  tokenSecret: string;
  nowSeconds: () => number;
};

export async function handleConfirm(body: unknown, deps: ConfirmDeps): Promise<HandlerResult> {
  const { token } = (body ?? {}) as Record<string, unknown>;
  if (typeof token !== 'string') return { status: 400, body: { status: 'invalid' } };

  const check = verifyToken(token, deps.tokenSecret, deps.nowSeconds());
  if (!check.ok) return { status: 400, body: { status: check.reason } };

  try {
    await deps.upsertContact(check.email);
  } catch {
    return { status: 502, body: { status: 'error' } };
  }
  return { status: 200, body: { status: 'subscribed' } };
}
