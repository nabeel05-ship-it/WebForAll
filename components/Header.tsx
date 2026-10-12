'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BrandLogo from '@/components/BrandLogo';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/demo', label: 'Interactive Demo' },
    { href: '/guide', label: 'Accessibility Guide' },
    { href: '/about', label: 'About & Security' },
  ];

  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-border-ink sticky top-0 z-40 transition-colors">
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
          <nav className="hidden md:flex items-center space-x-1.5 text-[15px]" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl font-bold transition-all relative ${
                    isActive
                      ? 'text-electric'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 bg-electric-soft rounded-xl -z-10 shadow-subtle border border-electric/15"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <span className="sr-only"> (current page)</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Engine Status Tag (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-soft/80 border border-teal/25 text-teal text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" aria-hidden="true" />
              axe-core 4.14
            </span>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-ink bg-canvas border border-border-ink hover:bg-surface focus:outline-none focus:ring-3 focus:ring-electric cursor-pointer transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
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
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-border-ink bg-surface px-4 py-4 space-y-2 shadow-elevated overflow-hidden"
          >
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-[16px] font-semibold transition-colors ${
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
            <div className="pt-2 px-2 border-t border-border-subtle flex items-center justify-between text-xs text-ink-muted">
              <span className="font-mono">axe-core 4.14 in ephemeral memory</span>
              <span className="text-teal font-bold">100% Client/Serverless</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
