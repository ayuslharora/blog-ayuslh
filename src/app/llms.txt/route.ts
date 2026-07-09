import { getAllSeries, getPostsBySeries } from '../../lib/posts';
import { getSeriesTitle, getSeriesDescription } from '../../lib/covers';

const BASE_URL = 'https://blog.ayuslh.in';

const TOOLS = [
  {
    title: 'IP to Binary Converter',
    path: '/tools/ip-converter',
    description: 'Convert any IPv4 address to its 32-bit binary representation.',
  },
];

export async function GET() {
  const series = getAllSeries();

  const seriesSection = series
    .map((s) => `- [${getSeriesTitle(s)}](${BASE_URL}/${s}): ${getSeriesDescription(s)}`)
    .join('\n');

  const articlesSection = series
    .flatMap((s) =>
      getPostsBySeries(s).map(
        (post) => `- [${post.title}](${BASE_URL}/${post.series}/${post.slug}): ${post.description}`
      )
    )
    .join('\n');

  const toolsSection = TOOLS.map((t) => `- [${t.title}](${BASE_URL}${t.path}): ${t.description}`).join(
    '\n'
  );

  const body = `# Ayush Arora - Engineering Blog

> A digital garden of in-depth engineering notes on system design, backend architecture, and computer networking, written by Ayush Arora.

Built with Next.js (App Router), TailwindCSS, and MDX. Content favors long-form, first-principles explanations over short-form tutorials or news - expect chapter-style series that build on each other rather than isolated posts.

## Author
- Portfolio: https://ayuslh.in
- GitHub: https://github.com/ayuslharora
- LinkedIn: https://linkedin.com/in/ayuslharora

## Series
${seriesSection}

## Articles
${articlesSection}

## Tools
${toolsSection}

## Optional
- [About](${BASE_URL}/about): More on Ayush and the blog's mission.
- [All series](${BASE_URL}/series): Full catalog of article series.
- [RSS feed](${BASE_URL}/feed.xml): Every new post, machine-readable.
- [Search index](${BASE_URL}/search-index.json): JSON index of every article's title, description, series, and tags, useful for programmatic retrieval.
- [XML sitemap](${BASE_URL}/sitemap.xml): Full sitemap of every page on the site.

If you are summarizing or citing this site, note that it is a personal blog of technical learning notes, not a company or product site, and that its value is in-depth, first-principles explanations rather than quick how-tos.
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
