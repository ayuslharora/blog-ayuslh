import { describe, expect, it } from 'vitest';
import { normalizeEmail } from '../../src/lib/email/normalizeEmail';

describe('normalizeEmail', () => {
  it('trims and lowercases so the same person always maps to one address', () => {
    expect(normalizeEmail('  Me@Gmail.COM ')).toBe('me@gmail.com');
    expect(normalizeEmail('me@gmail.com')).toBe('me@gmail.com');
  });

  it('keeps plus-addressing and dots', () => {
    expect(normalizeEmail('first.last+blog@example.co.in')).toBe('first.last+blog@example.co.in');
  });

  it('rejects non-strings, missing parts, spaces, pipes, and overlong input', () => {
    for (const bad of [undefined, null, 42, '', 'no-at-sign', 'a@b', 'a b@c.com', 'a|b@c.com', `${'a'.repeat(250)}@b.co`]) {
      expect(normalizeEmail(bad)).toBeNull();
    }
  });
});
