import { describe, expect, it } from 'vitest';
import { searchEntries, type SearchEntry } from '../../src/lib/searchIndex';

const entries: SearchEntry[] = [
  {
    title: 'Reliable, Scalable, Maintainable',
    description: 'Notes on trade-offs',
    series: 'ddia',
    slug: 'ch1-reliable-scalable-maintainable',
    tags: ['system-design', 'ddia'],
  },
  {
    title: 'Something Else Entirely',
    description: 'An unrelated post',
    series: 'other',
    slug: 'x',
    tags: ['book-notes'],
  },
];

describe('searchEntries', () => {
  it('returns an empty array for an empty query', () => {
    expect(searchEntries(entries, '')).toEqual([]);
  });

  it('returns an empty array for a whitespace-only query', () => {
    expect(searchEntries(entries, '   ')).toEqual([]);
  });

  it('matches on title, case-insensitively', () => {
    expect(searchEntries(entries, 'reliable')).toEqual([entries[0]]);
  });

  it('matches on description', () => {
    expect(searchEntries(entries, 'trade-offs')).toEqual([entries[0]]);
  });

  it('matches on tags', () => {
    expect(searchEntries(entries, 'book-notes')).toEqual([entries[1]]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchEntries(entries, 'zzz-nomatch')).toEqual([]);
  });
});
