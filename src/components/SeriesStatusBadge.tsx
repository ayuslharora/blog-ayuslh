import { getSeriesStatus } from '../lib/covers';

const STYLES = {
  ongoing: { label: 'Ongoing', dot: 'bg-amber-400 animate-pulse' },
  completed: { label: 'Completed', dot: 'bg-emerald-400' },
  'on-hold': { label: 'On Hold', dot: 'bg-white/40' },
} as const;

export default function SeriesStatusBadge({ slug }: { slug: string }) {
  const status = getSeriesStatus(slug);
  if (!status) return null;
  const { label, dot } = STYLES[status];

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
