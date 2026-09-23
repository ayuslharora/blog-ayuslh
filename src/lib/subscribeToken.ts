import { createHmac, timingSafeEqual } from 'node:crypto';

export const TOKEN_TTL_SECONDS = 48 * 60 * 60;

export type TokenCheck = { ok: true; email: string } | { ok: false; reason: 'expired' | 'invalid' };

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createToken(
  email: string,
  secret: string,
  nowSeconds: number,
  ttlSeconds: number = TOKEN_TTL_SECONDS
): string {
  const payload = Buffer.from(`${email}|${nowSeconds + ttlSeconds}`).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyToken(token: string, secret: string, nowSeconds: number): TokenCheck {
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: 'invalid' };
  const [payload, signature] = parts;

  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: 'invalid' };
  }

  const decoded = Buffer.from(payload, 'base64url').toString('utf8');
  const sep = decoded.lastIndexOf('|');
  const expiresAt = Number(decoded.slice(sep + 1));
  if (sep <= 0 || !Number.isInteger(expiresAt)) return { ok: false, reason: 'invalid' };
  if (nowSeconds >= expiresAt) return { ok: false, reason: 'expired' };
  return { ok: true, email: decoded.slice(0, sep) };
}
