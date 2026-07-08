import { describe, expect, it } from 'vitest';
import { getReadingTimeMinutes } from '../../src/lib/readingTime';

describe('getReadingTimeMinutes', () => {
  it('returns at least 1 minute for empty content', () => {
    expect(getReadingTimeMinutes('')).toBe(1);
  });

  it('returns 1 minute for content at or under 200 words', () => {
    const words = new Array(200).fill('word').join(' ');
    expect(getReadingTimeMinutes(words)).toBe(1);
  });

  it('rounds up partial minutes', () => {
    const words = new Array(401).fill('word').join(' ');
    expect(getReadingTimeMinutes(words)).toBe(3);
  });

  it('ignores extra whitespace between words', () => {
    expect(getReadingTimeMinutes('one   two\n\nthree\t four')).toBe(1);
  });
});
