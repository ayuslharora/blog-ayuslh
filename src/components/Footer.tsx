import { Github, Linkedin } from './icons/SocialIcons';

export default function Footer() {
  const items = new Array(6).fill(null);

  return (
    <footer className="w-full relative overflow-hidden py-3 border-t border-black/5 bg-white/40 backdrop-blur-md text-sm mt-24">
      <p className="sr-only">
        Made by Ayush Arora.{' '}
        <a href="https://www.linkedin.com/in/ayuslh/" rel="noreferrer">LinkedIn</a>{' '}
        <a href="https://github.com/ayuslharora" rel="noreferrer">GitHub</a>{' '}
        <a href="https://ayuslh.in" rel="noreferrer">Portfolio</a>
      </p>

      <div aria-hidden="true" className="flex w-[200%] animate-marquee">
        {items.map((_, i) => (
          <div key={i} className="flex flex-none items-center justify-center gap-6 px-8 whitespace-nowrap">
            <span className="font-medium tracking-wide text-zinc-600">
              Made by Ayush Arora
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <a
              href="https://www.linkedin.com/in/ayuslh/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              tabIndex={-1}
              className="text-zinc-500 hover:text-black transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <a
              href="https://github.com/ayuslharora"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              tabIndex={-1}
              className="text-zinc-500 hover:text-black transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        ))}
      </div>
    </footer>
  );
}
