import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'blog.ayuslh.in — Ayush Arora',
    template: '%s — blog.ayuslh.in',
  },
  description: "Ayush Arora's learning notes and write-ups.",
  metadataBase: new URL('https://blog.ayuslh.in'),
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className="min-h-full flex flex-col antialiased">
        <main className="w-full relative z-10">{children}</main>
      </body>
    </html>
  );
}
