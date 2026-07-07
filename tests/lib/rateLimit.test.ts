import { describe, expect, it } from 'vitest';
import { checkRateLimit, type RateLimitEntry } from '../../src/lib/rateLimit';

describe('checkRateLimit', () => {
  it('allows the first request in a fresh window', () => {
    const store = new Map<string, RateLimitEntry>();
    expect(checkRateLimit(store, 'ip1', 3, 60_000, 1000)).toBe(true);
  });

  it('allows requests up to the limit within the window', () => {
    const store = new Map<string, RateLimitEntry>();
    expect(checkRateLimit(store, 'ip1', 3, 60_000, 1000)).toBe(true);
    expect(checkRateLimit(store, 'ip1', 3, 60_000, 1100)).toBe(true);
    expect(checkRateLimit(store, 'ip1', 3, 60_000, 1200)).toBe(true);
  });

  it('blocks a request once the limit is exceeded within the window', () => {
    const store = new Map<string, RateLimitEntry>();
    checkRateLimit(store, 'ip1', 2, 60_000, 1000);
    checkRateLimit(store, 'ip1', 2, 60_000, 1100);
    expect(checkRateLimit(store, 'ip1', 2, 60_000, 1200)).toBe(false);
  });

  it('allows requests again once the window has passed', () => {
    const store = new Map<string, RateLimitEntry>();
    checkRateLimit(store, 'ip1', 1, 60_000, 1000);
    expect(checkRateLimit(store, 'ip1', 1, 60_000, 1000 + 60_000)).toBe(true);
  });

  it('tracks different keys independently', () => {
    const store = new Map<string, RateLimitEntry>();
    checkRateLimit(store, 'ip1', 1, 60_000, 1000);
    expect(checkRateLimit(store, 'ip2', 1, 60_000, 1000)).toBe(true);
  });
});
