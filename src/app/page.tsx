import Image from 'next/image';
import Link from 'next/link';
import { getAllPosts, getAllSeries } from '../lib/posts';
import { getSeriesTitle, hasCover } from '../lib/covers';

export default function Home() {
  const series = getAllSeries();
  const recentPosts = getAllPosts().slice(0, 10);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">blog.ayuslh.in</h1>
      <p className="text-zinc-500 mb-10">Learning notes and write-ups.</p>

      {series.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Series</h2>
          <ul className="flex flex-wrap gap-4">
            {series.map((s) => {
              const title = getSeriesTitle(s);
              return (
                <li key={s}>
                  <Link
                    href={`/${s}`}
                    className="flex flex-col items-center gap-2 w-28 group"
                  >
                    {hasCover(s) && (
                      <Image
                        src={`/covers/${s}.jpg`}
                        alt={title}
                        width={112}
                        height={168}
                        className="rounded-md shadow-md object-cover group-hover:shadow-lg transition-shadow"
                      />
                    )}
                    <span className="text-sm font-medium text-center group-hover:text-amber-500 transition-colors">
                      {title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent posts</h2>
        {recentPosts.length === 0 ? (
          <p className="text-zinc-500">Nothing published yet.</p>
        ) : (
          <ul className="space-y-4">
            {recentPosts.map((post) => (
              <li key={`${post.series}/${post.slug}`}>
                <Link
                  href={`/${post.series}/${post.slug}`}
                  className="text-lg font-medium hover:text-amber-500 transition-colors"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-zinc-500">{post.date} · {post.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
