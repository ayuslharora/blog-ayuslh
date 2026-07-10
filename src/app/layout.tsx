import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { serializeJsonLd, buildWebsiteJsonLd } from '../lib/jsonLd';
import { getAllTags } from '../lib/posts';
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Ayush Arora | System Design, Backend, and Networking Notes',
    template: '%s | Ayush Arora',
  },
  description:
    'In-depth notes and write-ups on system design, backend engineering, and computer networking, from Designing Data-Intensive Applications to how an HTTP request actually works.',
  metadataBase: new URL('https://blog.ayuslh.in'),
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tags = getAllTags();

  // Theme init script to prevent FOUC
  const themeInitScript = `
    (function() {
      try {
        var localTheme = window.localStorage.getItem('theme');
        var isDark = localTheme === 'dark' || (!localTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildWebsiteJsonLd()) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased overflow-x-hidden`}>
        <NavBar tags={tags} />
        <main className="w-full relative z-10 pt-28 flex-1 overflow-x-hidden">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
