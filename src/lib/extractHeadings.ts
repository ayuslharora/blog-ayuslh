import GithubSlugger from 'github-slugger';

export type Heading = { text: string; id: string };

// Mirrors what rehype-slug generates for H2s in the rendered MDX (same
// github-slugger algorithm), so these ids match the actual anchor ids on
// the page.
export function extractH2Headings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  const re = /^##\s+(.+)$/gm;
  let match;
  while ((match = re.exec(markdown))) {
    const text = match[1].trim();
    headings.push({ text, id: slugger.slug(text) });
  }
  return headings;
}
