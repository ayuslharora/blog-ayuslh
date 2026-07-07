'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-6 z-50 flex flex-col items-center px-4 md:px-6 pointer-events-none">
      <div className={`flex flex-col w-full max-w-7xl glass-panel pointer-events-auto overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'rounded-2xl' : 'rounded-full'}`}>
        
        {/* Main Navbar Bar */}
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Logo */}
          <div className="flex items-center min-w-[120px]">
            <Link href="/" className="relative w-10 h-10 transition-opacity hover:opacity-80">
              <Image 
                src="/navbar-logo.webp" 
                alt="Ayush Arora" 
                fill 
                className="object-contain dark:invert drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Center: Navigation Links (Hidden on small screens) */}
          <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 text-sm font-medium text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Articles</Link>
            
            {/* Categories Dropdown */}
            <div className="relative group cursor-pointer py-2">
              <span className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                Categories
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2">
                <Link href="/ddia" className="px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-sm transition-colors text-black dark:text-white font-semibold">Designing Data Intensive Applications</Link>
                <Link href="/system-design" className="px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-sm transition-colors text-black dark:text-white font-semibold">System Design</Link>
              </div>
            </div>

            <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer">Trending</span>
            <a href="https://ayuslh.in" className="hover:text-black dark:hover:text-white transition-colors">About</a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 md:gap-4 min-w-[120px]">
            {/* Search Icon */}
            <button aria-label="Search" className="text-[var(--text-secondary)] hover:text-black dark:hover:text-white transition-colors p-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            
            <ThemeToggle />
            
            <button className="hidden md:block px-5 py-2 rounded-full text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg hover:shadow-amber-500/20 active:scale-95">
              Subscribe
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-1.5 -mr-1.5 text-[var(--text-secondary)] hover:text-black dark:hover:text-white transition-colors rounded-lg bg-black/5 dark:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden flex flex-col border-t border-black/10 dark:border-white/10 px-6 py-4 gap-4 text-sm font-medium">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 transition-colors block">Home</Link>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 transition-colors block">Articles</Link>
            <div className="flex flex-col gap-2 pl-4 border-l-2 border-black/5 dark:border-white/5 py-1">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Categories</span>
              <Link href="/ddia" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 transition-colors text-sm">Designing Data Intensive Applications</Link>
              <Link href="/system-design" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 transition-colors text-sm">System Design</Link>
            </div>
            <span className="hover:text-amber-500 transition-colors cursor-pointer block">Trending</span>
            <a href="https://ayuslh.in" className="hover:text-amber-500 transition-colors block">About</a>
            
            <div className="pt-3 mt-1 border-t border-black/5 dark:border-white/5 flex flex-col gap-3">
              <button className="w-full py-2.5 rounded-full text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md">
                Subscribe
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
