'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import { Github, Linkedin } from './icons/SocialIcons';

const MOBILE_MENU_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/series', label: 'Series' },
  { href: '/category/tech', label: 'Tech' },
  { href: '/category/self-improvement', label: 'Self-improvements' },
];

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

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

              {/* Categories Dropdown */}
              <div className="relative py-2">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors outline-none cursor-pointer"
                >
                  Categories
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180 opacity-100 text-black dark:text-white' : 'opacity-50'}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                {/* Invisible Backdrop for click-outside */}
                {isCategoriesOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoriesOpen(false)} />
                )}

                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-xl transition-all duration-200 flex flex-col p-2 z-50 ${isCategoriesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <Link href="/category/tech" onClick={() => setIsCategoriesOpen(false)} className="px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-sm transition-colors text-black dark:text-white font-semibold">Tech</Link>
                  <Link href="/category/self-improvement" onClick={() => setIsCategoriesOpen(false)} className="px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-sm transition-colors text-black dark:text-white font-semibold">Self-improvements</Link>
                </div>
              </div>

              <a href="https://ayuslh.in" className="hover:text-black dark:hover:text-white transition-colors">About</a>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-3 md:gap-4 min-w-[120px]">
              {/* Search Icon */}
              <button aria-label="Search" className="text-[var(--text-secondary)] hover:text-black dark:hover:text-white transition-colors p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>

              <ThemeToggle />

              <button className="group/sub relative overflow-hidden hidden md:block px-5 py-2 rounded-full text-sm font-bold bg-black dark:bg-white text-white dark:text-black transition-transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg hover:shadow-amber-500/20">
                <span className="relative z-10 group-hover/sub:text-black dark:group-hover/sub:text-white transition-colors duration-300">Subscribe</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-x-full group-hover/sub:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
              </button>

              {/* Mobile Menu Toggle */}
              {!isMobileMenuOpen && (
                <button
                  className="lg:hidden p-1.5 -mr-1.5 text-[var(--text-secondary)] hover:text-black dark:hover:text-white transition-colors rounded-lg bg-black/5 dark:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={isMobileMenuOpen}
                >
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
        <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur-3xl lg:hidden animate-fade-in-up" style={{ animationDuration: '0.25s' }}>
          <div className="flex items-center justify-between px-6 py-8">
            <div className="relative w-10 h-10">
              <Image src="/navbar-logo.webp" alt="Ayush Arora" fill className="object-contain" />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white transition-colors text-4xl leading-none font-light"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {MOBILE_MENU_LINKS.map((link, i) => (
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
          </div>

          <div
            className="animate-fade-in-up pb-12 flex items-center justify-center gap-6 text-zinc-500 text-sm font-medium"
            style={{ animationDelay: `${MOBILE_MENU_LINKS.length * 0.08 + 0.2}s` }}
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
    </>
  );
}
