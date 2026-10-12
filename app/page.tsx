'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Terminal,
  ShieldCheck,
  Code2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  MousePointerClick,
  Palette,
  Keyboard,
  Eye,
  Check,
} from 'lucide-react';
import ReportView from '@/components/ReportView';
import { AccessibilityReport } from '@/lib/scanner/types';
import { X as ClearIcon } from 'lucide-react';

export default function HomePage() {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [scanError, setScanError] = useState<{ message: string; code?: string } | null>(null);
  const [report, setReport] = useState<AccessibilityReport | null>(null);

  // Category Explorer State
  const [activeCategory, setActiveCategory] = useState<string>('landmarks');

  // Before/After Showcase State
  const [activeShowcase, setActiveShowcase] = useState<'image' | 'form' | 'button' | 'contrast' | 'heading'>('button');
  const [copiedShowcase, setCopiedShowcase] = useState(false);

  const copyShowcaseCode = async (codeStr: string) => {
    try {
      await navigator.clipboard.writeText(codeStr);
      setCopiedShowcase(true);
      setTimeout(() => setCopiedShowcase(false), 2000);
    } catch {
      // Ignore fallback
    }
  };

  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = urlInput.trim();

    if (!target) {
      setScanError({ message: 'Please enter a valid website URL to begin scanning.', code: 'EMPTY_INPUT' });
      return;
    }

    setScanError(null);
    setIsScanning(true);
    setScanStepText('Validating URL destination & protocol...');

    const timers: NodeJS.Timeout[] = [];
    timers.push(
      setTimeout(() => {
        setScanStepText('Resolving DNS & filtering private network boundaries...');
      }, 350)
    );
    timers.push(
      setTimeout(() => {
        setScanStepText('Constructing sandboxed JSDOM in ephemeral memory...');
      }, 950)
    );
    timers.push(
      setTimeout(() => {
        setScanStepText('Evaluating axe-core 4.14 WCAG rules across DOM nodes...');
      }, 1600)
    );

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: target }),
      });

      timers.forEach(clearTimeout);

      let data: any = null;
      let rawText = '';
      try {
        rawText = await res.text();
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data || !data.success) {
        let errorMessage = data?.error;
        if (!errorMessage) {
          if (res.status === 500) {
            errorMessage = 'The scanner service is temporarily unavailable. Please try again shortly.';
          } else if (res.status === 504 || res.status === 408) {
            errorMessage = 'The scan request timed out. The destination website may be slow or unresponsive.';
          } else if (res.status >= 400 && res.status < 500) {
            errorMessage = `Unable to complete scan (HTTP ${res.status}). Please check the URL and try again.`;
          } else {
            errorMessage = 'The scanner returned an unreadable response. Please verify the URL and try again.';
          }
        }

        setScanError({
          message: errorMessage,
          code: data?.code || `HTTP_${res.status || 'ERROR'}`,
        });
        setIsScanning(false);
        setScanStepText('');
        return;
      }

      setReport(data.report);
      setIsScanning(false);
      setScanStepText('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      timers.forEach(clearTimeout);
      const error = err as Error;
      setScanError({
        message: `Network error: ${error.message || 'Unable to communicate with the scanner service.'}`,
        code: 'NETWORK_ERROR',
      });
      setIsScanning(false);
      setScanStepText('');
    }
  };

  // Categories for the "What WebForAll Sees" Explorer
  const categories = [
    {
      id: 'landmarks',
      label: 'Structure & Landmarks',
      icon: Layers,
      title: 'Logical Document Structure & Landmark Regions',
      desc: 'Verifies top-level <main> landmarks, skip navigation anchors, and sequential <h1> through <h6> heading hierarchies so screen reader users can skim page contents predictably.',
      exampleRule: 'landmark-one-main',
      exampleImpact: 'Moderate',
      exampleFix: 'Wrap central content in <main id="main-content"> and maintain sequential headings.',
    },
    {
      id: 'images',
      label: 'Images & Media',
      icon: ImageIcon,
      title: 'Informative Image Alternatives & Decorative Masks',
      desc: 'Detects <img> tags missing an alt attribute. Ensures informative charts convey visual meaning, while purely decorative icons specify empty alt="" so screen readers safely ignore them.',
      exampleRule: 'image-alt',
      exampleImpact: 'Critical',
      exampleFix: 'Add descriptive alt="Annual revenue chart" or alt="" for decorative elements.',
    },
    {
      id: 'forms',
      label: 'Forms & Inputs',
      icon: CheckSquare,
      title: 'Explicit Programmatic Form Labels',
      desc: 'Flags text inputs, checkboxes, and selects that rely solely on temporary placeholder attributes. Ensures every form control has a permanent, accessible <label for="id"> binding.',
      exampleRule: 'label',
      exampleImpact: 'Critical',
      exampleFix: '<label for="user-email">Email Address</label><input id="user-email" type="email">',
    },
    {
      id: 'buttons',
      label: 'Buttons & Links',
      icon: MousePointerClick,
      title: 'Discernible Interactive Action Names',
      desc: 'Checks that shopping carts, close icons, and hamburger menus provide accessible text. Screen readers must never announce a button as an unhelpful generic "button" without purpose.',
      exampleRule: 'button-name',
      exampleImpact: 'Critical',
      exampleFix: '<button aria-label="Delete item"><svg aria-hidden="true" .../></button>',
    },
    {
      id: 'contrast',
      label: 'Color Contrast',
      icon: Palette,
      title: 'Text & Visual Contrast Ratios',
      desc: 'Verifies foreground text against background colors to ensure compliance with the WCAG AA minimum 4.5:1 ratio for normal body text and 3:1 for large display headings.',
      exampleRule: 'color-contrast',
      exampleImpact: 'Serious',
      exampleFix: 'Increase foreground font darkness or surface brightness to achieve at least 4.5:1.',
    },
    {
      id: 'keyboard',
      label: 'Keyboard & Focus',
      icon: Keyboard,
      title: 'Keyboard Operability & Visible Focus Rings',
      desc: 'Catches removed focus outlines (outline: none) that strand keyboard users. Ensures all interactive elements can be focused via Tab and triggered via Enter or Space.',
      exampleRule: 'focus-order-semantics',
      exampleImpact: 'Serious',
      exampleFix: 'Always provide *:focus-visible { outline: 3px solid #3157E8; outline-offset: 2px; }',
    },
  ];

  const currentCategoryData = categories.find((c) => c.id === activeCategory) || categories[0];

  return (
    <div className="min-h-screen bg-canvas">
      {/* If a report is loaded, render the ReportView directly */}
      {report ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <ReportView
            report={report}
            onReset={() => {
              setReport(null);
              setScanError(null);
              setUrlInput('');
            }}
          />
        </div>
      ) : (
        <div>
            {/* ============================================================ */}
            {/* HERO SECTION — FOCUSED & REBALANCED SCANNER */}
            {/* ============================================================ */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-18 sm:pb-22 text-center relative">
              {/* Background Glow Effect */}
              <div
                aria-hidden="true"
                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-electric/10 rounded-full blur-3xl pointer-events-none -z-10"
              />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-violet-soft border border-violet/30 text-violet text-xs font-extrabold uppercase tracking-wider shadow-subtle">
                  <span className="w-2 h-2 rounded-full bg-violet animate-pulse" aria-hidden="true" />
                  <span>Making the web more accessible, one scan at a time</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.08] max-w-4xl mx-auto">
                  Find the barriers standing between your site and its people.
                </h1>

                <p className="text-lg sm:text-xl text-ink-muted leading-relaxed max-w-2xl mx-auto font-medium">
                  Scan any public website for accessibility barriers, understand their real-world human impact, and discover practical code fixes with WebForAll.
                </p>
              </motion.div>

              {/* PRIMARY SCANNER CARD */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl mx-auto pt-8"
              >
                <form
                  id="scanner"
                  onSubmit={handleSubmit}
                  noValidate
                  className="bg-surface rounded-2xl border-2 border-border-ink p-5 sm:p-7 space-y-4 shadow-card text-left transition-all hover:shadow-elevated hover:border-border-strong relative"
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor="target-url" className="block text-sm font-bold text-ink">
                      Enter any public website URL to scan
                    </label>
                    <span className="text-xs font-mono text-ink-muted hidden sm:inline-block">
                      HTTP / HTTPS
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-grow">
                      <input
                        ref={urlInputRef}
                        id="target-url"
                        type="url"
                        required
                        disabled={isScanning}
                        value={urlInput}
                        onChange={(e) => {
                          setUrlInput(e.target.value);
                          if (scanError) setScanError(null);
                        }}
                        placeholder="https://example.com"
                        className="w-full pl-4 pr-10 py-3.5 text-base text-ink bg-surface border-2 border-border-ink rounded-xl focus:border-electric focus:ring-4 focus:ring-electric/20 focus:outline-none disabled:bg-surface-subtle font-mono transition-all shadow-subtle"
                        aria-invalid={!!scanError}
                        aria-describedby={scanError ? 'scan-error-msg url-reassurance-hint' : 'url-reassurance-hint'}
                      />
                      {urlInput && !isScanning && (
                        <button
                          type="button"
                          onClick={() => {
                            setUrlInput('');
                            urlInputRef.current?.focus();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
                          aria-label="Clear website address input"
                        >
                          <ClearIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.015, y: -1 }}
                      whileTap={{ scale: 0.985, y: 0 }}
                      type="submit"
                      disabled={isScanning}
                      className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-extrabold text-base text-white bg-electric hover:bg-electric-hover active:bg-[#2244C9] disabled:bg-border-ink disabled:text-ink-muted transition-all shadow-electricGlow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-electric/30 whitespace-nowrap cursor-pointer"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                          Evaluating site...
                        </>
                      ) : (
                        <>
                          Scan website
                          <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Sample URL Presets for Instant Testing */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-ink-muted font-medium">
                    <span className="font-bold text-ink">Try sample:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUrlInput('https://example.com');
                        urlInputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 rounded-md bg-canvas hover:bg-cream border border-border-ink text-ink font-mono hover:text-electric transition-colors cursor-pointer"
                    >
                      example.com
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUrlInput('https://w3.org');
                        urlInputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 rounded-md bg-canvas hover:bg-cream border border-border-ink text-ink font-mono hover:text-electric transition-colors cursor-pointer"
                    >
                      w3.org
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUrlInput('https://en.wikipedia.org');
                        urlInputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 rounded-md bg-canvas hover:bg-cream border border-border-ink text-ink font-mono hover:text-electric transition-colors cursor-pointer"
                    >
                      wikipedia.org
                    </button>
                  </div>

                  <div id="url-reassurance-hint" className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ink-muted pt-1 gap-2">
                    <span className="font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-golden flex-shrink-0" aria-hidden="true" />
                      No account required &bull; Evaluated in ephemeral memory
                    </span>
                    <span className="text-teal font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal flex-shrink-0" aria-hidden="true" />
                      SSRF Protected &bull; Zero DB retention
                    </span>
                  </div>

                  {/* Status Announcements */}
                  <div aria-live="polite" role="status" className="min-h-[20px]">
                    {isScanning && (
                      <div className="inline-flex items-center gap-2 text-sm text-electric font-bold pt-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-electric animate-pulse" aria-hidden="true" />
                        <span>{scanStepText}</span>
                      </div>
                    )}
                  </div>

                  {/* Scan Error Banner */}
                  {scanError && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="p-4 rounded-xl bg-coral-soft border-2 border-coral/30 text-ink text-sm space-y-1.5 shadow-subtle"
                    >
                      <div className="flex items-center gap-2 font-extrabold text-coral">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <span>Scan Request Unsuccessful</span>
                        {scanError.code && (
                          <span className="font-mono font-bold text-xs bg-surface text-coral px-2 py-0.5 rounded border border-coral/30">
                            {scanError.code}
                          </span>
                        )}
                      </div>
                      <p id="scan-error-msg" className="text-ink-muted leading-relaxed font-medium">
                        {scanError.message}
                      </p>
                    </motion.div>
                  )}
                </form>

                {/* Secondary Action: Dedicated Demo Link */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/demo"
                    className="inline-flex items-center text-sm font-bold text-ink hover:text-electric bg-surface hover:bg-cream px-5 py-3 rounded-xl border border-border-ink shadow-subtle transition-all"
                  >
                    <Eye className="w-4 h-4 mr-2 text-violet" aria-hidden="true" />
                    Try the interactive demo storefront &rarr;
                  </Link>
                  <Link
                    href="/guide"
                    className="inline-flex items-center text-sm font-bold text-ink hover:text-electric bg-surface hover:bg-cream px-5 py-3 rounded-xl border border-border-ink shadow-subtle transition-all"
                  >
                    <Code2 className="w-4 h-4 mr-2 text-teal" aria-hidden="true" />
                    Explore Accessibility Field Guide &rarr;
                  </Link>
                </div>
              </motion.div>
            </section>

          {/* ============================================================ */}
          {/* SECTION 1: WHAT WEBFORALL SEES (INTERACTIVE EXPLORER) */}
          {/* ============================================================ */}
          <section className="bg-surface border-y border-border-ink py-18 sm:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-electric">
                  Comprehensive Coverage
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                  What WebForAll sees on your website
                </h2>
                <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
                  Select a category to explore how automated checks identify syntax and structural barriers across your DOM.
                </p>
              </div>

              {/* Horizontal Category Explorer Buttons */}
              <div className="flex flex-wrap gap-2.5 border-b border-border-subtle pb-4" role="tablist" aria-label="Scanner Categories">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-electric text-white shadow-electricGlow scale-102'
                          : 'bg-canvas text-ink-muted hover:text-ink hover:bg-cream border border-border-ink'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Category Detail Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-cream rounded-2xl border-2 border-border-ink p-6 sm:p-8 space-y-5 shadow-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-golden/30">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-ink">
                      {currentCategoryData.title}
                    </h3>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-surface font-bold text-ink border border-border-ink">
                        Rule: {currentCategoryData.exampleRule}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-coral-soft text-coral font-bold border border-coral/30">
                        {currentCategoryData.exampleImpact}
                      </span>
                    </div>
                  </div>

                  <p className="text-base sm:text-lg text-ink leading-relaxed font-medium">
                    {currentCategoryData.desc}
                  </p>

                  <div className="p-4 bg-surface rounded-xl border border-border-ink space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-teal block">
                      Developer Remediation Guidance:
                    </span>
                    <code className="font-mono text-sm text-ink block break-all">
                      {currentCategoryData.exampleFix}
                    </code>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 2: FROM PROBLEM TO PRACTICAL FIX (BEFORE/AFTER SHOWCASE) */}
          {/* ============================================================ */}
          <section className="bg-canvas py-18 sm:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-coral">
                  Actionable Engineering
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                  From problem to practical fix
                </h2>
                <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
                  We don&apos;t just list violations. WebForAll explains who is impacted and provides copy-ready code solutions.
                </p>
              </div>

              {/* Showcase Selector Pills */}
              <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Accessible Code Showcase">
                {[
                  { id: 'button', label: '1. Icon-Only Buttons' },
                  { id: 'image', label: '2. Missing Image Alt' },
                  { id: 'form', label: '3. Unlabelled Inputs' },
                  { id: 'contrast', label: '4. Low Color Contrast' },
                  { id: 'heading', label: '5. Skipped Headings' },
                ].map((item) => {
                  const isSelected = activeShowcase === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveShowcase(item.id as any)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-ink text-white shadow-card scale-102'
                          : 'bg-surface text-ink-muted hover:text-ink hover:bg-cream border border-border-ink'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Side-by-Side Comparison Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeShowcase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* LEFT: THE BARRIER */}
                  <div className="bg-coral-soft rounded-2xl border-2 border-coral/30 p-6 sm:p-8 space-y-4 shadow-subtle flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-coral uppercase tracking-wider flex items-center gap-1.5">
                          <AlertOctagon className="w-4 h-4" />
                          What the scanner found
                        </span>
                        <span className="text-xs font-bold text-coral bg-surface px-2.5 py-0.5 rounded-full border border-coral/20">
                          Barrier
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-ink">
                        {activeShowcase === 'button' && 'Cart button lacks accessible text'}
                        {activeShowcase === 'image' && 'Product image missing alt description'}
                        {activeShowcase === 'form' && 'Search input relies on placeholder only'}
                        {activeShowcase === 'contrast' && 'Subtle gray text fails WCAG 4.5:1 ratio'}
                        {activeShowcase === 'heading' && 'Heading jumps directly from <h1> to <h4>'}
                      </h3>

                      <p className="text-sm text-ink-muted leading-relaxed font-medium">
                        {activeShowcase === 'button' && 'Screen reader users hear only "button" without learning what action it triggers.'}
                        {activeShowcase === 'image' && 'Screen reader announces raw image file names like "hero_banner_v2.jpg" or "unlabelled graphic".'}
                        {activeShowcase === 'form' && 'Placeholders vanish when typing begins and are frequently skipped by speech technology.'}
                        {activeShowcase === 'contrast' && 'Low-vision readers or people using mobile devices under direct sunlight cannot read the text.'}
                        {activeShowcase === 'heading' && 'Screen reader users skimming via heading navigation (H) assume intermediate sections were skipped.'}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-xs font-bold text-coral block mb-1.5 font-sans">
                        Problematic Markup:
                      </span>
                      <pre className="font-mono text-xs text-ink bg-surface p-3.5 rounded-xl border border-coral/25 overflow-x-auto">
                        <code>
                          {activeShowcase === 'button' && '<button class="cart-btn">\n  <svg class="icon-cart"></svg>\n</button>'}
                          {activeShowcase === 'image' && '<img src="/assets/q3-growth.png">'}
                          {activeShowcase === 'form' && '<input type="email"\n  placeholder="Enter your email">'}
                          {activeShowcase === 'contrast' && '/* Contrast: 2.1:1 (Fails AA) */\ncolor: #94A3B8; background: #FFFFFF;'}
                          {activeShowcase === 'heading' && '<h1>Welcome to Storefront</h1>\n<!-- Missing <h2> and <h3> -->\n<h4 class="promo-banner">Clearance</h4>'}
                        </code>
                      </pre>
                    </div>
                  </div>

                  {/* RIGHT: THE REMEDY */}
                  <div className="bg-teal-soft rounded-2xl border-2 border-teal/30 p-6 sm:p-8 space-y-4 shadow-subtle flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-teal uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Accessible Solution
                        </span>
                        <span className="text-xs font-bold text-teal bg-surface px-2.5 py-0.5 rounded-full border border-teal/20">
                          Verified Fix
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-ink">
                        {activeShowcase === 'button' && 'Add explicit aria-label or text'}
                        {activeShowcase === 'image' && 'Provide descriptive alt text attribute'}
                        {activeShowcase === 'form' && 'Pair with visible programmatic <label>'}
                        {activeShowcase === 'contrast' && 'Increase foreground contrast to at least 4.5:1'}
                        {activeShowcase === 'heading' && 'Maintain strict sequential heading hierarchy'}
                      </h3>

                      <p className="text-sm text-ink-muted leading-relaxed font-medium">
                        {activeShowcase === 'button' && 'Now assistive technology announces "Add item to cart, button" clearly.'}
                        {activeShowcase === 'image' && 'Screen readers announce the visual meaning: "Quarterly revenue grew by 14%".'}
                        {activeShowcase === 'form' && 'The field label remains visible at all times and can be clicked to focus the input.'}
                        {activeShowcase === 'contrast' && 'High-contrast text guarantees readability across all lighting conditions and vision capabilities.'}
                        {activeShowcase === 'heading' && 'Hierarchical headings create an outline allowing keyboard and screen-reader skim navigation.'}
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-teal block font-sans">
                          Accessible Markup:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            let codeToCopy = '';
                            if (activeShowcase === 'button') codeToCopy = '<button aria-label="Add item to cart">\n  <svg aria-hidden="true" .../>\n</button>';
                            if (activeShowcase === 'image') codeToCopy = '<img src="/assets/q3-growth.png"\n  alt="Q3 revenue increased by 14%">';
                            if (activeShowcase === 'form') codeToCopy = '<label for="user-email">Email Address</label>\n<input id="user-email" type="email">';
                            if (activeShowcase === 'contrast') codeToCopy = '/* Contrast: 7.2:1 (Passes AAA) */\ncolor: #18233A; background: #FFFFFF;';
                            if (activeShowcase === 'heading') codeToCopy = '<h1>Welcome to Storefront</h1>\n<h2 class="promo-banner">Clearance</h2>';
                            copyShowcaseCode(codeToCopy);
                          }}
                          className="inline-flex items-center text-xs font-bold text-teal bg-surface px-2.5 py-1 rounded-md border border-teal/25 hover:bg-teal-soft transition-colors cursor-pointer"
                        >
                          {copiedShowcase ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Code2 className="w-3.5 h-3.5 mr-1" />
                              Copy Code
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="font-mono text-xs text-ink bg-surface p-3.5 rounded-xl border border-teal/25 overflow-x-auto">
                        <code>
                          {activeShowcase === 'button' && '<button aria-label="Add item to cart">\n  <svg aria-hidden="true" .../>\n</button>'}
                          {activeShowcase === 'image' && '<img src="/assets/q3-growth.png"\n  alt="Q3 revenue increased by 14%">'}
                          {activeShowcase === 'form' && '<label for="user-email">Email Address</label>\n<input id="user-email" type="email">'}
                          {activeShowcase === 'contrast' && '/* Contrast: 7.2:1 (Passes AAA) */\ncolor: #18233A; background: #FFFFFF;'}
                          {activeShowcase === 'heading' && '<h1>Welcome to Storefront</h1>\n<h2 class="promo-banner">Clearance</h2>'}
                        </code>
                      </pre>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 3: ONE SCAN, A CLEARER NEXT STEP (3-STAGE NARRATIVE) */}
          {/* ============================================================ */}
          <section className="bg-surface border-t border-border-ink py-18 sm:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-violet">
                  How It Works
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                  One scan, a clearer next step
                </h2>
                <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
                  A transparent three-step progression from URL input to shipping verified accessibility improvements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="p-6 bg-canvas rounded-2xl border-2 border-border-ink space-y-3.5 shadow-subtle hover:border-electric transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-electric uppercase tracking-wider bg-surface px-2.5 py-1 rounded-md border border-border-ink">
                      Step 01
                    </span>
                    <ShieldCheck className="w-5 h-5 text-electric" />
                  </div>
                  <h3 className="text-xl font-extrabold text-ink">
                    Submit Public URL
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed font-medium">
                    Enter any website address. WebForAll securely resolves the DNS destination, rejects private IPv4/IPv6 networks, defends against SSRF, and fetches the static HTML payload directly into ephemeral memory.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-6 bg-canvas rounded-2xl border-2 border-border-ink space-y-3.5 shadow-subtle hover:border-golden transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-golden uppercase tracking-wider bg-surface px-2.5 py-1 rounded-md border border-border-ink">
                      Step 02
                    </span>
                    <Layers className="w-5 h-5 text-golden" />
                  </div>
                  <h3 className="text-xl font-extrabold text-ink">
                    Evaluate Virtual DOM
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed font-medium">
                    Headless JSDOM parses the DOM tree in a sandboxed Node.js runtime without executing untrusted third-party scripts. axe-core 4.14 tests WCAG 2.1 Level A and AA rules deterministically.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-6 bg-canvas rounded-2xl border-2 border-border-ink space-y-3.5 shadow-subtle hover:border-teal transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-teal uppercase tracking-wider bg-surface px-2.5 py-1 rounded-md border border-border-ink">
                      Step 03
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-teal" />
                  </div>
                  <h3 className="text-xl font-extrabold text-ink">
                    Inspect & Remediate
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed font-medium">
                    Review violations categorized by human impact, copy exact CSS selectors with one click, inspect verified before/after code solutions, or export multi-page PDF and JSON audit documents.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 4: TRUST & BOUNDARIES */}
          {/* ============================================================ */}
          <section className="bg-canvas border-t border-border-ink py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                  Honest Engineering Boundaries
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  What automated scans do—and what they don&apos;t
                </h2>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-medium">
                  We believe in transparent engineering: automated scans are an indispensable first step in continuous delivery, but cannot replace manual assistive evaluation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="p-6 bg-surface rounded-2xl border-2 border-border-ink space-y-3 shadow-subtle">
                  <div className="flex items-center gap-2 text-ink font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                    <span>What automated testing catches reliably</span>
                  </div>
                  <ul className="space-y-2 text-ink-muted list-disc pl-5 font-medium text-xs sm:text-sm">
                    <li>Deterministic DOM syntax (missing alt attributes, empty links, invalid ARIA).</li>
                    <li>Missing form labels and unlabelled interactive controls.</li>
                    <li>Structural tags, HTML lang attributes, and duplicate IDs.</li>
                    <li>Covers approximately <strong>30% to 50%</strong> of potential WCAG criteria.</li>
                  </ul>
                </div>

                <div className="p-6 bg-surface rounded-2xl border-2 border-border-ink space-y-3 shadow-subtle">
                  <div className="flex items-center gap-2 text-ink font-bold text-base">
                    <AlertTriangle className="w-5 h-5 text-golden flex-shrink-0" />
                    <span>What requires manual human review</span>
                  </div>
                  <ul className="space-y-2 text-ink-muted list-disc pl-5 font-medium text-xs sm:text-sm">
                    <li>Whether image descriptions are genuinely meaningful in their context.</li>
                    <li>Interactive keyboard-only navigation flows (Tab order, focus trapping).</li>
                    <li>Real assistive screen reader tasks (VoiceOver, NVDA, JAWS).</li>
                    <li>Cognitive clarity, plain language, and error recovery guidance.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 5: FINAL CALL TO ACTION BAND */}
          {/* ============================================================ */}
          <section className="bg-electric text-white py-16 sm:py-20 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-golden block">
                Start In Seconds
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Ready to find out what needs attention on your website?
              </h2>
              <p className="text-base sm:text-lg text-white/85 max-w-xl mx-auto font-medium">
                Enter your URL above or try our controlled storefront fixture with known accessibility barriers.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    urlInputRef.current?.focus();
                  }}
                  className="px-6 py-3.5 rounded-xl font-extrabold text-base text-ink bg-white hover:bg-cream transition-colors shadow-elevated cursor-pointer"
                >
                  Scan a website now &uarr;
                </button>
                <Link
                  href="/demo"
                  className="px-6 py-3.5 rounded-xl font-bold text-base text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-colors"
                >
                  Try the interactive demo storefront &rarr;
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
