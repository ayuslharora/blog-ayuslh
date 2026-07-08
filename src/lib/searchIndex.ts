export type SearchEntry = {
  title: string;
  description: string;
  series: string;
  slug: string;
  tags: string[];
};

export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}
