import SubscribeForm from '../../components/SubscribeForm';

export const metadata = {
  title: 'Subscribe',
  description: 'Get an email when a new post goes up on blog.ayuslh.in.',
  alternates: { canonical: '/subscribe' },
};

export default function SubscribePage() {
  return (
    <div className="max-w-xl mx-auto px-6 pb-20 pt-10 md:pt-16">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">
        Newsletter
      </span>
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Get new posts by email</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
        One email when something new goes up. Unsubscribe with one click.
      </p>
      <SubscribeForm />
      <p className="mt-6 text-sm text-zinc-500">
        Prefer RSS?{' '}
        <a href="/feed.xml" className="underline hover:text-amber-500">
          Use the feed
        </a>
        .
      </p>
    </div>
  );
}
