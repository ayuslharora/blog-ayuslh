import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { getSeriesTitle, hasCover } from '../../src/lib/covers';

const FIXTURES = path.join(__dirname, '../fixtures/covers');

describe('getSeriesTitle', () => {
  it('returns the display title for a known series', () => {
    expect(getSeriesTitle('ddia')).toBe('Designing Data-Intensive Applications');
  });

  it('falls back to the raw slug for an unknown series', () => {
    expect(getSeriesTitle('some-new-series')).toBe('some-new-series');
  });
});

describe('hasCover', () => {
  it('returns true when a matching cover file exists', () => {
    expect(hasCover('hascover', FIXTURES)).toBe(true);
  });

  it('returns false when no matching cover file exists', () => {
    expect(hasCover('nocoverhere', FIXTURES)).toBe(false);
  });
});
