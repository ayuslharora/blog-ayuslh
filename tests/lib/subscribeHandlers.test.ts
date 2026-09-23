import { describe, expect, it, vi } from 'vitest';
import { handleConfirm, handleSubscribe, type SubscribeDeps } from '../../src/lib/subscribe/handlers';
import { createToken, verifyToken } from '../../src/lib/subscribeToken';

const SECRET = 's3cret';
const NOW = 1_800_000_000;

function subscribeDeps(overrides: Partial<SubscribeDeps> = {}) {
  const sendEmail = vi.fn(async (_m: { to: string; subject: string; html: string; text: string }) => ({}));
  const deps: SubscribeDeps = {
    verifyTurnstile: async () => true,
    sendEmail,
    tokenSecret: SECRET,
    nowSeconds: () => NOW,
    siteUrl: 'https://blog.ayuslh.in',
    ...overrides,
  };
  return { deps, sendEmail: deps.sendEmail as typeof sendEmail };
}

describe('handleSubscribe', () => {
  it('silently accepts bots that fill the honeypot without sending anything', async () => {
    const { deps, sendEmail } = subscribeDeps();
    const res = await handleSubscribe({ email: 'a@b.co', company: 'Acme', turnstileToken: 't' }, deps);
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', async () => {
    const { deps, sendEmail } = subscribeDeps();
    expect((await handleSubscribe({ email: 'nope', turnstileToken: 't' }, deps)).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('rejects a failed or missing spam check', async () => {
    const { deps, sendEmail } = subscribeDeps({ verifyTurnstile: async () => false });
    expect((await handleSubscribe({ email: 'a@b.co', turnstileToken: 't' }, deps)).status).toBe(400);
    expect((await handleSubscribe({ email: 'a@b.co' }, subscribeDeps().deps)).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('emails a working confirm link to the normalized address', async () => {
    const { deps, sendEmail } = subscribeDeps();
    const res = await handleSubscribe({ email: '  Me@Example.COM ', turnstileToken: 't' }, deps);
    expect(res).toEqual({ status: 200, body: { ok: true } });
    const msg = sendEmail.mock.calls[0][0] as { to: string; text: string };
    expect(msg.to).toBe('me@example.com');
    const url = new URL(msg.text.match(/https:\/\/\S+/)![0]);
    expect(url.origin + url.pathname).toBe('https://blog.ayuslh.in/subscribe/confirm');
    expect(verifyToken(url.searchParams.get('token')!, SECRET, NOW)).toEqual({ ok: true, email: 'me@example.com' });
  });

  it('reports a retryable error instead of "check your inbox" when Resend fails', async () => {
    const { deps } = subscribeDeps({ sendEmail: async () => { throw new Error('daily_quota_exceeded'); } });
    const res = await handleSubscribe({ email: 'a@b.co', turnstileToken: 't' }, deps);
    expect(res.status).toBe(502);
    expect(res.body.ok).toBeUndefined();
  });
});

describe('handleConfirm', () => {
  const deps = (upsertContact = vi.fn(async () => {})) => ({ upsertContact, tokenSecret: SECRET, nowSeconds: () => NOW });

  it('subscribes the address in a valid token', async () => {
    const upsert = vi.fn(async () => {});
    const res = await handleConfirm({ token: createToken('a@b.co', SECRET, NOW) }, deps(upsert));
    expect(res).toEqual({ status: 200, body: { status: 'subscribed' } });
    expect(upsert).toHaveBeenCalledWith('a@b.co');
  });

  it('succeeds again when the same link is confirmed twice', async () => {
    const d = deps();
    const token = createToken('a@b.co', SECRET, NOW);
    expect((await handleConfirm({ token }, d)).body).toEqual({ status: 'subscribed' });
    expect((await handleConfirm({ token }, d)).body).toEqual({ status: 'subscribed' });
  });

  it('reports expired and invalid tokens without touching Resend', async () => {
    const upsert = vi.fn(async () => {});
    const old = createToken('a@b.co', SECRET, NOW - 3 * 24 * 3600);
    expect((await handleConfirm({ token: old }, deps(upsert))).body).toEqual({ status: 'expired' });
    expect((await handleConfirm({ token: 'garbage' }, deps(upsert))).body).toEqual({ status: 'invalid' });
    expect((await handleConfirm({}, deps(upsert))).body).toEqual({ status: 'invalid' });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('reports an error when Resend fails', async () => {
    const res = await handleConfirm(
      { token: createToken('a@b.co', SECRET, NOW) },
      deps(vi.fn(async () => { throw new Error('boom'); }))
    );
    expect(res).toEqual({ status: 502, body: { status: 'error' } });
  });
});
