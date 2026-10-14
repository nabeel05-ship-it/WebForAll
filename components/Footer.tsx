import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-auto relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/70 to-transparent" />
      <div aria-hidden="true" className="absolute -top-40 left-1/2 -translate-x-1/2 w-[40rem] h-72 rounded-full bg-electric/15 blur-[100px] pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-10 border-b border-white/15">
          <div className="space-y-3 max-w-xl">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl py-1 transition-opacity hover:opacity-90 focus-visible:outline-golden"
              aria-label="WebForAll Home"
            >
              <BrandLogo iconSize={34} theme="dark" />
            </Link>
            <p className="text-base text-white/75 leading-relaxed font-medium">
              Better web experiences start with one check. Find barriers, understand their human impact, and ship accessible fixes with confidence.
            </p>
          </div>

          {/* Real-time System Status Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono whitespace-nowrap text-white/90">
              <span className="w-2 h-2 rounded-full bg-teal-bright animate-pulse" aria-hidden="true" />
              <span>Engine: axe-core 4.14</span>
              <span className="text-white/40">&bull;</span>
              <span>Ephemeral Memory</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono whitespace-nowrap text-white/70">
              <span>Zero DB Retention</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-sm text-white/75">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2.5" aria-label="Footer Navigation">
            <Link href="/" className="hover:text-white transition-colors font-semibold focus-visible:outline-golden">
              Home
            </Link>
            <Link href="/demo" className="hover:text-white transition-colors font-semibold focus-visible:outline-golden">
              Interactive Demo
            </Link>
            <Link href="/guide" className="hover:text-white transition-colors font-semibold focus-visible:outline-golden">
              Accessibility Guide
            </Link>
            <Link href="/about" className="hover:text-white transition-colors font-semibold focus-visible:outline-golden">
              About & Security
            </Link>
            <a
              href="https://www.w3.org/WAI/standards-guidelines/wcag/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors font-semibold focus-visible:outline-golden inline-flex items-center gap-1"
            >
              WCAG 2.1 Standard
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </nav>

          <div className="text-xs text-white/60 space-y-1 sm:text-right font-medium">
            <p>&copy; {new Date().getFullYear()} WebForAll &bull; Open-source axe-core accessibility engine.</p>
            <p className="text-white/60">Private by design &bull; Sandboxed JSDOM execution &bull; SSRF-protected</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
