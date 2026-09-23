import { describe, expect, it } from 'vitest';
import { waitForLive } from '../../src/lib/notify/waitForLive';

function clock() {
  let t = 0;
  return { now: () => t, sleep: async (ms: number) => { t += ms; } };
}

function fetchSeq(statusesByUrl: Record<string, Array<number | 'throw'>>) {
  return (async (url: string) => {
    const next = statusesByUrl[url].length > 1 ? statusesByUrl[url].shift()! : statusesByUrl[url][0];
    if (next === 'throw') throw new Error('network');
    return new Response(null, { status: next });
  }) as unknown as typeof fetch;
}

describe('waitForLive', () => {
  it('returns true immediately when everything is already up', async () => {
    const c = clock();
    const ok = await waitForLive(['a', 'b'], { intervalMs: 20_000, timeoutMs: 900_000, fetchImpl: fetchSeq({ a: [200], b: [200] }), ...c });
    expect(ok).toBe(true);
    expect(c.now()).toBe(0);
  });

  it('keeps polling until every URL returns 200, treating network errors as not yet live', async () => {
    const c = clock();
    const ok = await waitForLive(['a', 'b'], {
      intervalMs: 20_000,
      timeoutMs: 900_000,
      fetchImpl: fetchSeq({ a: [404, 'throw', 200], b: [200] }),
      ...c,
    });
    expect(ok).toBe(true);
    expect(c.now()).toBe(40_000);
  });

  it('gives up after the timeout', async () => {
    const c = clock();
    const ok = await waitForLive(['a'], { intervalMs: 20_000, timeoutMs: 60_000, fetchImpl: fetchSeq({ a: [404] }), ...c });
    expect(ok).toBe(false);
    expect(c.now()).toBe(60_000);
  });
});
