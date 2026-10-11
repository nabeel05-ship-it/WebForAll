'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BrandLogo from '@/components/BrandLogo';

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
          {/* Brand Identity: Icon + Readable Wordmark */}
          <Link
            href="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-electric rounded-xl py-1 px-1.5 transition-transform hover:opacity-95"
            aria-label="WebForAll Home"
          >
            <BrandLogo priority iconSize={36} />
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
