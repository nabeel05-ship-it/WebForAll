import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-ink text-white border-t border-ink mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-10 border-b border-white/15">
          <div className="space-y-3 max-w-xl">
            <Link
              href="/"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-electric rounded-xl py-1 transition-opacity hover:opacity-95"
              aria-label="WebForAll Home"
            >
              <BrandLogo iconSize={34} theme="dark" />
            </Link>
            <p className="text-base text-white/75 leading-relaxed font-medium">
              Better web experiences start with one check. Find barriers, understand their human impact, and ship accessible fixes with confidence.
            </p>
          </div>

          {/* Real-time System Status Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-white/90">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" aria-hidden="true" />
              <span>Engine: axe-core 4.14</span>
              <span className="text-white/40">&bull;</span>
              <span>Ephemeral Memory</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70">
              <span>Zero DB Retention</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-sm text-white/75">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2.5" aria-label="Footer Navigation">
            <Link href="/" className="hover:text-white transition-colors font-semibold">
              Home
            </Link>
            <Link href="/demo" className="hover:text-white transition-colors font-semibold">
              Interactive Demo
            </Link>
            <Link href="/guide" className="hover:text-white transition-colors font-semibold">
              Accessibility Guide
            </Link>
            <Link href="/about" className="hover:text-white transition-colors font-semibold">
              About & Security
            </Link>
            <a
              href="https://www.w3.org/WAI/standards-guidelines/wcag/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors font-semibold inline-flex items-center gap-1"
            >
              WCAG 2.1 Standard
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </nav>

          <div className="text-xs text-white/60 space-y-1 sm:text-right font-medium">
            <p>&copy; {new Date().getFullYear()} WebForAll &bull; Open-source axe-core accessibility engine.</p>
            <p className="text-white/45">Private by design &bull; Sandboxed JSDOM execution &bull; SSRF-protected</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
