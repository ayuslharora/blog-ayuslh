import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { serializeJsonLd, buildWebsiteJsonLd, buildPersonJsonLd } from '../lib/jsonLd';
import { getAllCategories } from '../lib/covers';
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: "Ayush Arora's Blog | Technical Deep Dives",
    template: '%s | Ayush Arora',
  },
  description:
    'Technical deep dives into system design, machine learning, and computer networking, from first principles to production.',
  metadataBase: new URL('https://blog.ayuslh.in'),
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'Ayush Arora',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getAllCategories();

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
        {/* next/script with strategy="beforeInteractive": Next.js injects this
            directly into the initial HTML and runs it before hydration, so a
            dark-mode browser never flashes light on a slow/cold load. A plain
            <script> tag here triggers a React 19 client-render warning since
            React never executes script tags it renders itself. */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased overflow-x-hidden`}>
        <Script
          id="jsonld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildWebsiteJsonLd()) }}
        />
        <Script
          id="jsonld-person"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildPersonJsonLd()) }}
        />
        <NavBar categories={categories} />
        <main className="w-full relative z-10 pt-28 flex-1 overflow-x-hidden">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
