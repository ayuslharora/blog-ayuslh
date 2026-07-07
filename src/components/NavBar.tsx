import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="fixed inset-x-0 top-6 z-50 flex justify-center px-4 md:px-0">
      <div className="flex items-center justify-between w-full max-w-3xl rounded-full bg-white/60 backdrop-blur-md border border-black/5 px-6 py-3 shadow-lg">
        <Link href="/" className="font-bold text-sm tracking-tight hover:text-amber-500 transition-colors">
          blog.ayuslh.in
        </Link>
        <a
          href="https://ayuslh.in"
          className="px-4 py-1.5 rounded-full text-sm font-medium bg-black text-white hover:bg-black/80 transition-colors"
        >
          ayuslh.in ↗
        </a>
      </div>
    </header>
  );
}
