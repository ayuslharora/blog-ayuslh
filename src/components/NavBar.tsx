'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import SearchModal from './SearchModal';
import { Github, Linkedin } from './icons/SocialIcons';
import { CATEGORIES } from '../data/categories';

const STATIC_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/series', label: 'Series' },
  { href: '/til', label: 'TIL' },
];

function categoryLabel(slug: string): string {
  return CATEGORIES[slug]?.title ?? slug;
}

export default function NavBar({ categories }: { categories: string[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only the desktop floating dropdown needs outside-click/Escape handling.
    // The mobile overlay reuses `isCategoriesOpen` for its own back-button-driven
    // view, and isn't wrapped by `categoriesRef` — attaching this listener while
    // the mobile menu is open would treat every tap on a mobile category link as
    // an "outside click" (mousedown fires before click) and close the list before
    // the tap can navigate.
    if (!isCategoriesOpen || isMobileMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsCategoriesOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCategoriesOpen, isMobileMenuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-6 z-50 flex flex-col items-center px-4 md:px-6 pointer-events-none">
        <div className="flex flex-col w-full max-w-7xl rounded-full navbar-frost pointer-events-auto transition-all duration-300">
          {/* Main Navbar Bar */}
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: Logo */}
            <div className="flex items-center min-w-[120px]">
              <Link href="/" className="relative w-10 h-10 transition-opacity hover:opacity-80">
                <Image
                  src="/navbar-logo.webp"
                  alt="Ayush Arora"
                  fill
                  className="object-contain invert dark:invert-0 transition-all"
                />
              </Link>
            </div>

            {/* Center: Navigation Links (Hidden on small screens) */}
            <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 text-sm font-medium text-[var(--text-secondary)]">
              <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
              <Link href="/series" className="hover:text-black dark:hover:text-white transition-colors">Series</Link>

              <div ref={categoriesRef} className="relative">
                <button
                  onClick={() => setIsCategoriesOpen((open) => !open)}
                  className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors outline-none cursor-pointer"
                  aria-expanded={isCategoriesOpen}
                >
                  Categories
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : 'opacity-50'}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                {isCategoriesOpen && (
                  <div className="navbar-frost absolute left-1/2 top-full mt-3 -translate-x-1/2 flex flex-col gap-1 rounded-2xl p-2 min-w-[180px] shadow-xl">
                    {categories.length === 0 ? (
                      <span className="px-3 py-2 text-sm">No categories yet</span>
                    ) : (
                      categories.map((slug) => (
                        <Link
                          key={slug}
                          href={`/category/${slug}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className="px-3 py-2 rounded-xl text-sm hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          {categoryLabel(slug)}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-3 md:gap-4 min-w-[120px]">
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search posts"
                className="relative text-[var(--text-secondary)] hover:text-black dark:hover:text-white transition-colors p-1"
              >
                <span className="absolute -inset-2" aria-hidden="true" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>

              <ThemeToggle />

              <a
                href="/feed.xml"
                className="group/sub relative overflow-hidden hidden md:block px-5 py-2 rounded-full text-sm font-bold bg-black dark:bg-white text-white dark:text-black transition-transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg hover:shadow-amber-500/20"
              >
                <span className="relative z-10 group-hover/sub:text-black dark:group-hover/sub:text-white transition-colors duration-300">Subscribe</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-x-full group-hover/sub:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
              </a>

              {/* Mobile Menu Toggle */}
              {!isMobileMenuOpen && (
                <button
                  className="relative lg:hidden p-1.5 -mr-1.5 text-[var(--text-secondary)] hover:text-black dark:hover:text-white transition-colors rounded-lg bg-black/5 dark:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="absolute -inset-1.5" aria-hidden="true" />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur-3xl lg:hidden animate-fade-in-up overflow-y-auto" style={{ animationDuration: '0.25s' }}>
          <div className="flex items-center justify-between px-6 py-8">
            <div className="relative w-10 h-10">
              <Image src="/navbar-logo.webp" alt="Ayush Arora" fill className="object-contain" />
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCategoriesOpen(false);
              }}
              className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white transition-colors text-4xl leading-none font-light"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
            {isCategoriesOpen ? (
              <>
                <button
                  onClick={() => setIsCategoriesOpen(false)}
                  className="animate-fade-in-up text-4xl sm:text-5xl font-bold capitalize tracking-tight text-amber-500"
                  style={{ animationDelay: '0.1s' }}
                >
                  Categories
                </button>
                <div className="animate-fade-in-up flex flex-col items-center gap-5 mt-2" style={{ animationDelay: '0.18s' }}>
                  {categories.length === 0 ? (
                    <span className="text-lg text-zinc-400">No categories yet</span>
                  ) : (
                    categories.map((slug) => (
                      <Link
                        key={slug}
                        href={`/category/${slug}`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsCategoriesOpen(false);
                        }}
                        className="text-2xl sm:text-3xl font-semibold text-zinc-100 hover:text-amber-500 transition-colors"
                      >
                        {categoryLabel(slug)}
                      </Link>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {STATIC_LINKS.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="animate-fade-in-up text-4xl sm:text-5xl font-bold capitalize tracking-tight text-zinc-100 hover:text-amber-500 transition-colors"
                    style={{ animationDelay: `${i * 0.08 + 0.1}s` }}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => setIsCategoriesOpen(true)}
                  className="animate-fade-in-up text-4xl sm:text-5xl font-bold capitalize tracking-tight text-zinc-100 hover:text-amber-500 transition-colors"
                  style={{ animationDelay: `${STATIC_LINKS.length * 0.08 + 0.1}s` }}
                >
                  Categories
                </button>
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="animate-fade-in-up text-4xl sm:text-5xl font-bold capitalize tracking-tight text-zinc-100 hover:text-amber-500 transition-colors"
                  style={{ animationDelay: `${(STATIC_LINKS.length + 1) * 0.08 + 0.1}s` }}
                >
                  About
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="animate-fade-in-up text-4xl sm:text-5xl font-bold capitalize tracking-tight text-zinc-100 hover:text-amber-500 transition-colors"
                  style={{ animationDelay: `${(STATIC_LINKS.length + 2) * 0.08 + 0.1}s` }}
                >
                  Search
                </button>
              </>
            )}
          </div>

          <div
            className="animate-fade-in-up pb-12 flex items-center justify-center gap-6 text-zinc-500 text-sm font-medium"
            style={{ animationDelay: `${(STATIC_LINKS.length + 3) * 0.08 + 0.3}s` }}
          >
            <a
              href="https://www.linkedin.com/in/ayuslh/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="hover:text-zinc-300 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/ayuslharora"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hover:text-zinc-300 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
