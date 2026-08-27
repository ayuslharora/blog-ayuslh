import Link from 'next/link';
import Script from 'next/script';
import { buildProfilePageJsonLd, serializeJsonLd } from '../../lib/jsonLd';
import { getAllSeries, getPostsBySeries } from '../../lib/posts';
import { getSeriesTitle } from '../../lib/covers';

export const metadata = {
  title: 'About',
  description:
    'Ayush Arora is a developer writing hands-on notes on system design, backend engineering, and computer networking, distilled from real building and reading.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const series = getAllSeries().map((s) => ({
    slug: s,
    title: getSeriesTitle(s),
    count: getPostsBySeries(s).length,
  }));

  return (
    <div className="max-w-4xl mx-auto px-6 pb-20 pt-10 md:pt-16">
      <Script
        id="jsonld-profile"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildProfilePageJsonLd()) }}
      />
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-10 mb-12">
        <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-6xl md:text-7xl text-white shadow-2xl ring-8 ring-black/5 dark:ring-white/10 animate-fade-in-up">
          A
        </div>

        <div className="text-center md:text-left animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">
            Who I Am
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Hey! I&apos;m <span className="text-amber-500">Ayush 👋</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium leading-relaxed max-w-2xl">
            I&apos;m a Computer Science undergrad at BITS Pilani, working as an AI Engineer &amp; Full Stack Developer. This blog is where I write up what I&apos;m learning about backend systems, networking, and distributed data, one chapter at a time.
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className="rounded-3xl p-8 md:p-10 bg-[#0a0a0a] border border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Subtle Background Glow */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />

        <div className="relative z-10 space-y-6 text-lg text-white/70 leading-relaxed">
          <p>
            My day-to-day work leans toward real-time AI systems, computer vision, and generative AI applications, but this blog is a separate, deliberate exercise: forcing myself to actually understand the fundamentals underneath the systems I build, instead of treating them as black boxes. The Networking Fundamentals series starts from &quot;what happens when you hit enter on a URL&quot; and builds up to routing decisions; the DDIA series is my chapter-by-chapter notes working through Martin Kleppmann&apos;s <em>Designing Data-Intensive Applications</em>.
          </p>
          <p>
            I believe the best way to learn something well enough to use it is to explain it clearly enough that someone else could too. Every article here is the output of that: hours of reading and building, distilled into something I wish I&apos;d had when I started.
          </p>
          <p>
            For the fuller picture (projects, resume, what I&apos;m building day to day), my{' '}
            <a
              href="https://ayuslh.in"
              className="font-semibold text-amber-500 hover:text-amber-400 underline underline-offset-2 transition-colors"
            >
              portfolio
            </a>{' '}
            has the complete version. This page is just the &quot;why I write&quot; story.
          </p>
        </div>

        {/* What I write about */}
        <div className="mt-10 pt-8 border-t border-white/10 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4 block">
            What I write about here
          </span>
          <div className="flex flex-wrap gap-2.5">
            {series.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="group/chip inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-sm font-semibold transition-colors"
              >
                {s.title}
                <span className="text-[11px] font-bold text-amber-500 group-hover/chip:text-amber-400">
                  {s.count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4 relative z-10">
          <a
            href="https://ayuslh.in"
            className="group/btn relative overflow-hidden w-full sm:w-auto px-10 flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-bold bg-white text-black hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 shadow-xl shadow-amber-500/20"
          >
            <span className="relative z-10 group-hover/btn:text-black transition-colors duration-300">View Portfolio</span>
            <svg className="relative z-10" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
          </a>

          <a href="https://github.com/ayuslharora" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="group/github relative overflow-hidden shrink-0 p-4 rounded-full bg-white text-black transition-transform duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/20">
            <svg className="relative z-10" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-y-full group-hover/github:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
          </a>

          <a href="https://linkedin.com/in/ayuslharora" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="group/linkedin relative overflow-hidden shrink-0 p-4 rounded-full bg-white text-black transition-transform duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/20">
            <svg className="relative z-10" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-y-full group-hover/linkedin:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
          </a>
        </div>
      </div>
    </div>
  );
}
