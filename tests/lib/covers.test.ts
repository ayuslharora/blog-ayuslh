import { describe, expect, it } from 'vitest';
import path from 'node:path';
import {
  getSeriesTitle,
  hasCover,
  getSeriesCategory,
  getAllCategories,
  getSeriesByCategory,
  getCategoryTitle,
  getCategoryDescription,
} from '../../src/lib/covers';

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

describe('getSeriesCategory', () => {
  it('returns the category slug for a known series', () => {
    expect(getSeriesCategory('networking')).toBe('networking');
    expect(getSeriesCategory('ddia')).toBe('system-design');
  });

  it('returns undefined for a series with no category mapping', () => {
    expect(getSeriesCategory('some-new-series')).toBeUndefined();
  });
});

describe('getAllCategories', () => {
  it('returns categories present in the given series list, in CATEGORIES definition order', () => {
    expect(getAllCategories(['ddia', 'networking'])).toEqual(['networking', 'system-design']);
  });

  it('excludes categories with no matching series', () => {
    expect(getAllCategories(['ddia'])).toEqual(['system-design']);
  });

  it('returns an empty array when no series map to a category', () => {
    expect(getAllCategories(['unknown-series'])).toEqual([]);
  });
});

describe('getSeriesByCategory', () => {
  it('returns series slugs belonging to a category', () => {
    expect(getSeriesByCategory('networking', ['ddia', 'networking'])).toEqual(['networking']);
  });

  it('returns an empty array when no series match the category', () => {
    expect(getSeriesByCategory('networking', ['ddia'])).toEqual([]);
  });
});

describe('getCategoryTitle', () => {
  it('returns the display title for a known category', () => {
    expect(getCategoryTitle('networking')).toBe('Networking');
  });

  it('falls back to the raw slug for an unknown category', () => {
    expect(getCategoryTitle('some-new-category')).toBe('some-new-category');
  });
});

describe('getCategoryDescription', () => {
  it('returns the description for a known category', () => {
    expect(getCategoryDescription('networking')).toBe(
      'How computer networks actually work: HTTP requests, DNS resolution, IP addressing, and routing.'
    );
  });

  it('falls back to a generic sentence for an unknown category', () => {
    expect(getCategoryDescription('some-new-category')).toBe(
      'All series in the "some-new-category" category.'
    );
  });
});
