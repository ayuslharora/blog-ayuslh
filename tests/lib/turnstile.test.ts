import { describe, expect, it } from 'vitest';
import { verifyTurnstile } from '../../src/lib/turnstile';

function fetchReturning(status: number, body: unknown) {
  const seen: URLSearchParams[] = [];
  const fn = (async (_url: string, init: RequestInit) => {
    seen.push(new URLSearchParams(init.body as URLSearchParams));
    return new Response(JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
  return { fn, seen };
}

describe('verifyTurnstile', () => {
  it('passes secret, token, and IP to siteverify and returns success', async () => {
    const { fn, seen } = fetchReturning(200, { success: true });
    expect(await verifyTurnstile('tok', 'sec', '1.2.3.4', fn)).toBe(true);
    expect(Object.fromEntries(seen[0])).toEqual({ secret: 'sec', response: 'tok', remoteip: '1.2.3.4' });
  });

  it('returns false for a failed check, an HTTP error, or an empty token', async () => {
    expect(await verifyTurnstile('tok', 'sec', undefined, fetchReturning(200, { success: false }).fn)).toBe(false);
    expect(await verifyTurnstile('tok', 'sec', undefined, fetchReturning(500, {}).fn)).toBe(false);
    expect(await verifyTurnstile('', 'sec', undefined, fetchReturning(200, { success: true }).fn)).toBe(false);
  });
});
