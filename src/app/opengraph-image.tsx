import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
        <div style={{ fontSize: 28, color: '#fbbf24', marginBottom: 24 }}>blog.ayuslh.in</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>Ayush Arora</div>
        <div style={{ fontSize: 32, color: '#a1a1aa', marginTop: 20 }}>
          Notes on system design, backend engineering, and networking
        </div>
      </div>
    ),
    { ...size }
  );
}
