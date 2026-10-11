import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink text-white border-t border-ink mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/15">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-golden" aria-hidden="true" />
              <span className="text-xl font-extrabold tracking-tight text-white">WebForAll</span>
              <span className="text-white/40">&bull;</span>
              <span className="text-sm font-semibold text-white/80">Accessibility, made actionable</span>
            </div>
            <p className="text-base text-white/70 max-w-lg leading-relaxed">
              Better web experiences start with one check. Find barriers, fix with confidence, and build for everyone.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-white/70">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Footer Navigation">
            <Link href="/" className="hover:text-white transition-colors font-medium">
              Home
            </Link>
            <Link href="/demo" className="hover:text-white transition-colors font-medium">
              Interactive Demo
            </Link>
            <Link href="/guide" className="hover:text-white transition-colors font-medium">
              Accessibility Guide
            </Link>
            <Link href="/about" className="hover:text-white transition-colors font-medium">
              About & Security
            </Link>
            <a
              href="https://www.w3.org/WAI/standards-guidelines/wcag/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors font-medium inline-flex items-center gap-1"
            >
              WCAG 2.1 Standard
            </a>
          </nav>

          <div className="text-xs text-white/50 space-y-0.5 sm:text-right">
            <p>&copy; {new Date().getFullYear()} WebForAll &bull; Open-source axe-core evaluation.</p>
            <p>Private by design: Ephemeral memory only. Zero database retention.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
