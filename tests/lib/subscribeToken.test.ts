import { describe, expect, it } from 'vitest';
import { createToken, TOKEN_TTL_SECONDS, verifyToken } from '../../src/lib/subscribeToken';

const SECRET = 'test-secret-value';
const NOW = 1_800_000_000;

describe('subscribe tokens', () => {
  it('round-trips an email', () => {
    const token = createToken('first.last+blog@example.co.in', SECRET, NOW);
    expect(verifyToken(token, SECRET, NOW + 60)).toEqual({ ok: true, email: 'first.last+blog@example.co.in' });
  });

  it('is URL-safe', () => {
    expect(createToken('a@b.co', SECRET, NOW)).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it('expires after 48 hours', () => {
    const token = createToken('a@b.co', SECRET, NOW);
    expect(verifyToken(token, SECRET, NOW + TOKEN_TTL_SECONDS - 1).ok).toBe(true);
    expect(verifyToken(token, SECRET, NOW + TOKEN_TTL_SECONDS)).toEqual({ ok: false, reason: 'expired' });
  });

  it('rejects a payload swapped for another address', () => {
    const [, signature] = createToken('a@b.co', SECRET, NOW).split('.');
    const forgedPayload = Buffer.from(`victim@x.co|${NOW + 1000}`).toString('base64url');
    expect(verifyToken(`${forgedPayload}.${signature}`, SECRET, NOW)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('rejects a tampered signature, a different secret, and malformed tokens', () => {
    const token = createToken('a@b.co', SECRET, NOW);
    expect(verifyToken(`${token}x`, SECRET, NOW).ok).toBe(false);
    expect(verifyToken(token, 'other-secret', NOW).ok).toBe(false);
    for (const bad of ['', 'abc', 'a.b.c', '.', `${token}.extra`]) {
      expect(verifyToken(bad, SECRET, NOW)).toEqual({ ok: false, reason: 'invalid' });
    }
  });
});
