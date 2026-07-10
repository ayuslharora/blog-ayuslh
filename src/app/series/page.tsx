import { getAllSeries } from '../../lib/posts';
import SeriesCard from '../../components/SeriesCard';

export const metadata = {
  title: 'Series Catalog',
  description:
    'Browse every series on the blog, from Designing Data-Intensive Applications notes to a Networking Fundamentals series covering HTTP, DNS, and IP addressing.',
};

export default function SeriesPage() {
  const series = getAllSeries();

  return (
    <div className="max-w-6xl mx-auto px-6 pb-24 pt-12">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <header className="mb-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
          Series <span className="text-amber-500">Catalog</span>
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-secondary)] font-medium max-w-3xl">
          Deep-dive collections into system design, data architecture, and software engineering principles.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <SeriesCard key={s} slug={s} />
        ))}
      </div>
    </div>
  );
}
