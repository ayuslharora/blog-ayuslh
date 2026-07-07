import type { Metadata } from 'next';
import './globals.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { serializeJsonLd, buildWebsiteJsonLd } from '../lib/jsonLd';

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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildWebsiteJsonLd()) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <NavBar />
        <main className="w-full relative z-10 pt-28">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
