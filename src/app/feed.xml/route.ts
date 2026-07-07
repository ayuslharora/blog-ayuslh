import { getAllPosts } from '../../lib/posts';

export async function GET() {
  const posts = getAllPosts();

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://blog.ayuslh.in/${post.series}/${post.slug}</link>
      <guid>https://blog.ayuslh.in/${post.series}/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>blog.ayuslh.in</title>
    <link>https://blog.ayuslh.in</link>
    <description>Ayush Arora's learning notes and write-ups.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
