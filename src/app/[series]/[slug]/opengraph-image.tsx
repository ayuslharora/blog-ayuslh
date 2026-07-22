import { ImageResponse } from 'next/og';
import { getPostBySlug, getAllPosts } from '../../../lib/posts';

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ series: post.series, slug: post.slug }));
}

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ series: string; slug: string }>;
}) {
  const { series, slug } = await params;
  const post = getPostBySlug(series, slug);
  const title = post?.title ?? 'blog.ayuslh.in';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0a0a0a',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 28, color: '#fbbf24', marginBottom: 24 }}>
          {`${series} · blog.ayuslh.in`}
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
      </div>
    ),
    { ...size }
  );
}
