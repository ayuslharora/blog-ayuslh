import { describe, expect, it } from 'vitest';
import { createResendClient, FROM_ADDRESS } from '../../src/lib/resend';

function fakeFetch(responses: Array<{ status: number; body?: unknown }>) {
  const calls: Array<{ url: string; method: string; body: unknown; auth: string | null }> = [];
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({
      url,
      method: init.method ?? 'GET',
      body: init.body ? JSON.parse(init.body as string) : undefined,
      auth: new Headers(init.headers).get('Authorization'),
    });
    const r = responses.shift() ?? { status: 200, body: {} };
    return new Response(r.body === undefined ? null : JSON.stringify(r.body), { status: r.status });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

const SEG = 'seg-123';

describe('resend client', () => {
  it('sends a transactional email from the newsletter address', async () => {
    const { fn, calls } = fakeFetch([{ status: 200, body: { id: 'e1' } }]);
    await createResendClient('key', fn).sendEmail({ to: 'a@b.co', subject: 'S', html: '<p>h</p>', text: 't' });
    expect(calls[0]).toMatchObject({ url: 'https://api.resend.com/emails', method: 'POST', auth: 'Bearer key' });
    expect(calls[0].body).toEqual({ from: FROM_ADDRESS, to: 'a@b.co', subject: 'S', html: '<p>h</p>', text: 't' });
  });

  it('creates a new contact in the segment with one call', async () => {
    const { fn, calls } = fakeFetch([{ status: 201, body: { id: 'c1' } }]);
    await createResendClient('key', fn).upsertContact('a@b.co', SEG);
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toEqual({ email: 'a@b.co', unsubscribed: false, segments: [{ id: SEG }] });
  });

  it('falls back to update + add-to-segment when the contact already exists', async () => {
    const { fn, calls } = fakeFetch([{ status: 409, body: { message: 'exists' } }, { status: 200 }, { status: 200 }]);
    await createResendClient('key', fn).upsertContact('a+b@c.co', SEG);
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'POST https://api.resend.com/contacts',
      'PATCH https://api.resend.com/contacts/a%2Bb%40c.co',
      `POST https://api.resend.com/contacts/a%2Bb%40c.co/segments/${SEG}`,
    ]);
    expect(calls[1].body).toEqual({ unsubscribed: false });
  });

  it('treats "already in segment" as success, so confirming twice works', async () => {
    const { fn } = fakeFetch([{ status: 409 }, { status: 200 }, { status: 409, body: { message: 'already in segment' } }]);
    await expect(createResendClient('key', fn).upsertContact('a@b.co', SEG)).resolves.toBeUndefined();
  });

  it('does not fall back on auth, rate-limit, or server errors', async () => {
    for (const status of [401, 403, 429, 500]) {
      const { fn, calls } = fakeFetch([{ status }]);
      await expect(createResendClient('key', fn).upsertContact('a@b.co', SEG)).rejects.toMatchObject({ status });
      expect(calls).toHaveLength(1);
    }
  });

  it('lists broadcast names', async () => {
    const { fn } = fakeFetch([{ status: 200, body: { data: [{ name: 'new-posts:abc' }, { name: null }] } }]);
    expect(await createResendClient('key', fn).listBroadcastNames()).toEqual(['new-posts:abc', '']);
  });

  it('creates and sends a broadcast in one call', async () => {
    const { fn, calls } = fakeFetch([{ status: 200, body: { id: 'b1' } }]);
    await createResendClient('key', fn).createAndSendBroadcast({ segmentId: SEG, name: 'n', subject: 's', html: 'h', text: 't' });
    expect(calls[0]).toMatchObject({ url: 'https://api.resend.com/broadcasts', method: 'POST' });
    expect(calls[0].body).toEqual({ segment_id: SEG, from: FROM_ADDRESS, name: 'n', subject: 's', html: 'h', text: 't', send: true });
  });
});
