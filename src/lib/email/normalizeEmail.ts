// Pipes are excluded because the confirmation token uses "|" as its separator.
const EMAIL_SHAPE = /^[^\s@|]+@[^\s@|]+\.[^\s@|]+$/;

export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const email = input.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_SHAPE.test(email)) return null;
  return email;
}
