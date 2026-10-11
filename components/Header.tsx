'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/demo', label: 'Interactive Demo' },
    { href: '/guide', label: 'Accessibility Guide' },
    { href: '/about', label: 'About & Security' },
  ];

  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-border-ink sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 py-3.5 items-center">
          {/* Logo & Brand Wordmark with Scan Frame & Signal Dot */}
          <Link
            href="/"
            className="flex items-center space-x-3 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-electric rounded-lg py-1 px-1.5 group transition-colors"
            aria-label="WebForAll Home"
          >
            {/* Distinctive Logo Mark: Scan-Frame with Vivid Signal Dots */}
            <div className="w-9 h-9 rounded-lg bg-electric text-white flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform relative">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                aria-hidden="true"
              >
                <path
                  d="M3 7V4a1 1 0 0 1 1-1h3M13 3h3a1 1 0 0 1 1 1v3M17 13v3a1 1 0 0 1-1 1h-3M7 17H4a1 1 0 0 1-1-1v-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Signal Dot */}
              <span className="absolute w-2 h-2 rounded-full bg-golden border border-white" />
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-ink flex items-center gap-1.5">
                WebForAll
                <span className="w-2 h-2 rounded-full bg-coral inline-block" aria-hidden="true" />
              </span>
              <span className="text-xs text-ink-muted font-medium -mt-0.5 hidden sm:block">
                Accessibility, made actionable
              </span>
            </div>
          </Link>

          {/* Desktop Navigation — Spacious & Centered / Balanced */}
          <nav className="hidden md:flex items-center space-x-2 text-[15px]" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl font-bold transition-all relative ${
                    isActive
                      ? 'text-electric bg-electric-soft shadow-subtle'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                  {isActive && (
                    <span className="sr-only"> (current page)</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ink bg-canvas border border-border-ink hover:bg-surface focus:outline-none focus:ring-3 focus:ring-electric cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border-ink bg-surface px-4 py-4 space-y-2 shadow-elevated overflow-hidden"
          >
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-[16px] font-semibold transition-colors ${
                    isActive
                      ? 'text-electric bg-electric-soft font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
