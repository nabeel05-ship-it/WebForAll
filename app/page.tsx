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
  ShieldCheck,
  Code2,
  Copy,
  Cpu,
  Globe,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  MousePointerClick,
  Palette,
  Keyboard,
  Eye,
  Check,
  Zap,
  X as ClearIcon,
} from 'lucide-react';
import ReportView from '@/components/ReportView';
import { AccessibilityReport } from '@/lib/scanner/types';
import { handleTabListKeyDown } from '@/lib/a11y/tabs';

type ShowcaseId = 'button' | 'image' | 'form' | 'contrast' | 'heading';

export default function HomePage() {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [scanError, setScanError] = useState<{ message: string; code?: string } | null>(null);
  const [report, setReport] = useState<AccessibilityReport | null>(null);

  // Category Explorer State
  const [activeCategory, setActiveCategory] = useState<string>('landmarks');

  // Before/After Showcase State
  const [activeShowcase, setActiveShowcase] = useState<ShowcaseId>('button');
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

  const impactBadgeClass: Record<string, string> = {
    Critical: 'bg-coral-soft text-coral border-coral/25',
    Serious: 'bg-golden-soft text-golden-ink border-golden/40',
    Moderate: 'bg-violet-soft text-violet border-violet/25',
  };

  // Before/After showcase content
  const showcases: Record<ShowcaseId, {
    label: string;
    barrierTitle: string;
    barrierDesc: string;
    barrierCode: string;
    fixTitle: string;
    fixDesc: string;
    fixCode: string;
  }> = {
    button: {
      label: 'Icon-only buttons',
      barrierTitle: 'Cart button lacks accessible text',
      barrierDesc: 'Screen reader users hear only "button" without learning what action it triggers.',
      barrierCode: '<button class="cart-btn">\n  <svg class="icon-cart"></svg>\n</button>',
      fixTitle: 'Add explicit aria-label or text',
      fixDesc: 'Now assistive technology announces "Add item to cart, button" clearly.',
      fixCode: '<button aria-label="Add item to cart">\n  <svg aria-hidden="true" .../>\n</button>',
    },
    image: {
      label: 'Missing image alt',
      barrierTitle: 'Product image missing alt description',
      barrierDesc: 'Screen reader announces raw image file names like "hero_banner_v2.jpg" or "unlabelled graphic".',
      barrierCode: '<img src="/assets/q3-growth.png">',
      fixTitle: 'Provide descriptive alt text attribute',
      fixDesc: 'Screen readers announce the visual meaning: "Quarterly revenue grew by 14%".',
      fixCode: '<img src="/assets/q3-growth.png"\n  alt="Q3 revenue increased by 14%">',
    },
    form: {
      label: 'Unlabelled inputs',
      barrierTitle: 'Search input relies on placeholder only',
      barrierDesc: 'Placeholders vanish when typing begins and are frequently skipped by speech technology.',
      barrierCode: '<input type="email"\n  placeholder="Enter your email">',
      fixTitle: 'Pair with visible programmatic <label>',
      fixDesc: 'The field label remains visible at all times and can be clicked to focus the input.',
      fixCode: '<label for="user-email">Email Address</label>\n<input id="user-email" type="email">',
    },
    contrast: {
      label: 'Low color contrast',
      barrierTitle: 'Subtle gray text fails WCAG 4.5:1 ratio',
      barrierDesc: 'Low-vision readers or people using mobile devices under direct sunlight cannot read the text.',
      barrierCode: '/* Contrast: 2.6:1 (Fails AA) */\ncolor: #94A3B8; background: #FFFFFF;',
      fixTitle: 'Increase foreground contrast to at least 4.5:1',
      fixDesc: 'High-contrast text guarantees readability across all lighting conditions and vision capabilities.',
      fixCode: '/* Contrast: 17.9:1 (Passes AAA) */\ncolor: #0F1729; background: #FFFFFF;',
    },
    heading: {
      label: 'Skipped headings',
      barrierTitle: 'Heading jumps directly from <h1> to <h4>',
      barrierDesc: 'Screen reader users skimming via heading navigation (H) assume intermediate sections were skipped.',
      barrierCode: '<h1>Welcome to Storefront</h1>\n<!-- Missing <h2> and <h3> -->\n<h4 class="promo-banner">Clearance</h4>',
      fixTitle: 'Maintain strict sequential heading hierarchy',
      fixDesc: 'Hierarchical headings create an outline allowing keyboard and screen-reader skim navigation.',
      fixCode: '<h1>Welcome to Storefront</h1>\n<h2 class="promo-banner">Clearance</h2>',
    },
  };
  const showcaseIds = Object.keys(showcases) as ShowcaseId[];
  const currentShowcase = showcases[activeShowcase];

  const trustSignals = [
    { icon: ShieldCheck, label: 'WCAG 2.1 A & AA rules' },
    { icon: Cpu, label: 'axe-core 4.14 engine' },
    { icon: Lock, label: 'Zero data retained' },
    { icon: Zap, label: 'No sign-up required' },
  ];

  const steps = [
    {
      num: '01',
      icon: ShieldCheck,
      accent: 'text-electric bg-electric-soft',
      title: 'Submit public URL',
      body: 'Enter any website address. WebForAll securely resolves the DNS destination, rejects private IPv4/IPv6 networks, defends against SSRF, and fetches the static HTML payload directly into ephemeral memory.',
    },
    {
      num: '02',
      icon: Layers,
      accent: 'text-violet bg-violet-soft',
      title: 'Evaluate virtual DOM',
      body: 'Headless JSDOM parses the DOM tree in a sandboxed Node.js runtime without executing untrusted third-party scripts. axe-core 4.14 tests WCAG 2.1 Level A and AA rules deterministically.',
    },
    {
      num: '03',
      icon: CheckCircle2,
      accent: 'text-teal bg-teal-soft',
      title: 'Inspect & remediate',
      body: 'Review violations categorized by human impact, copy exact CSS selectors with one click, inspect verified before/after code solutions, or export multi-page PDF and JSON audit documents.',
    },
  ];

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
          {/* HERO SECTION — FOCUSED SCANNER */}
          {/* ============================================================ */}
          <section className="bg-aurora overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-18 sm:pt-22 sm:pb-24 text-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-7"
              >
                <div className="inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white/75 backdrop-blur border border-border-ink shadow-glass text-[13px] font-semibold text-ink-muted">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ink text-white text-[11px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-bright animate-pulse" aria-hidden="true" />
                    Free
                  </span>
                  <span>Making the web more accessible, one scan at a time</span>
                </div>

                <h1 className="text-[2.6rem] sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] text-ink leading-[1.04] max-w-4xl mx-auto">
                  Find the barriers standing between your site and{' '}
                  <span className="text-gradient-brand">its people.</span>
                </h1>

                <p className="text-lg sm:text-xl text-ink-muted leading-relaxed max-w-2xl mx-auto font-medium">
                  Scan any public website for accessibility barriers, understand their real-world human impact, and ship practical code fixes with WebForAll.
                </p>
              </motion.div>

              {/* PRIMARY SCANNER CARD */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl mx-auto pt-10"
              >
                <form
                  id="scanner"
                  onSubmit={handleSubmit}
                  noValidate
                  className="ring-gradient bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 space-y-4 shadow-elevated text-left"
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor="target-url" className="block text-sm font-bold text-ink">
                      Enter any public website URL to scan
                    </label>
                    <span className="text-[11px] font-mono font-semibold text-ink-muted hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-canvas border border-border-subtle">
                      <Globe className="w-3 h-3" aria-hidden="true" />
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
                        className="w-full pl-4 pr-10 py-3.5 text-base text-ink bg-surface border border-border-input rounded-xl focus:border-electric focus:ring-4 focus:ring-electric/15 focus:outline-none disabled:bg-surface-subtle font-mono transition-all shadow-subtle placeholder:text-ink-subtle"
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
                          <ClearIcon className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.985, y: 0 }}
                      type="submit"
                      disabled={isScanning}
                      className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-b from-[#3D63F0] to-electric hover:to-electric-hover disabled:from-border-ink disabled:to-border-ink disabled:text-ink-muted transition-colors shadow-electricGlow focus-visible:ring-4 focus-visible:ring-electric/30 whitespace-nowrap cursor-pointer"
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
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-ink-muted font-medium">
                    <span className="font-semibold text-ink-muted mr-0.5">Try a sample:</span>
                    {[
                      { url: 'https://example.com', label: 'example.com' },
                      { url: 'https://w3.org', label: 'w3.org' },
                      { url: 'https://en.wikipedia.org', label: 'wikipedia.org' },
                    ].map((sample) => (
                      <button
                        key={sample.url}
                        type="button"
                        onClick={() => {
                          setUrlInput(sample.url);
                          urlInputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-full bg-canvas hover:bg-electric-soft border border-border-ink hover:border-electric/30 text-ink font-mono hover:text-electric transition-colors cursor-pointer"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>

                  <div id="url-reassurance-hint" className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ink-muted pt-3 gap-2 border-t border-border-subtle">
                    <span className="font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-golden-ink flex-shrink-0" aria-hidden="true" />
                      No account required &bull; Evaluated in ephemeral memory
                    </span>
                    <span className="text-teal font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal flex-shrink-0" aria-hidden="true" />
                      SSRF Protected &bull; Zero DB retention
                    </span>
                  </div>

                  {/* Status Announcements */}
                  <div aria-live="polite" role="status" className={isScanning ? 'min-h-[20px]' : ''}>
                    {isScanning && (
                      <div className="inline-flex items-center gap-2 text-sm text-electric font-bold">
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
                      className="p-4 rounded-xl bg-coral-soft border border-coral/25 text-ink text-sm space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center gap-2 font-extrabold text-coral">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <span>Scan Request Unsuccessful</span>
                        {scanError.code && (
                          <span className="font-mono font-bold text-xs bg-surface text-coral px-2 py-0.5 rounded border border-coral/25">
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

                {/* Secondary Actions */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/demo"
                    className="group inline-flex items-center text-sm font-bold text-ink bg-white/70 backdrop-blur hover:bg-white px-5 py-3 rounded-full border border-border-ink shadow-glass transition-all"
                  >
                    <Eye className="w-4 h-4 mr-2 text-violet" aria-hidden="true" />
                    Try the interactive demo storefront
                    <ArrowRight className="w-4 h-4 ml-1.5 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/guide"
                    className="group inline-flex items-center text-sm font-bold text-ink bg-white/70 backdrop-blur hover:bg-white px-5 py-3 rounded-full border border-border-ink shadow-glass transition-all"
                  >
                    <Code2 className="w-4 h-4 mr-2 text-teal" aria-hidden="true" />
                    Explore the Accessibility Field Guide
                    <ArrowRight className="w-4 h-4 ml-1.5 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>

              {/* Trust Strip */}
              <ul className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border-ink bg-border-ink max-w-4xl mx-auto shadow-subtle">
                {trustSignals.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center justify-center gap-2 bg-white/85 backdrop-blur px-4 py-4 text-sm font-semibold text-ink">
                    <Icon className="w-4 h-4 text-electric flex-shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 1: WHAT WEBFORALL SEES (INTERACTIVE EXPLORER) */}
          {/* ============================================================ */}
          <section className="bg-surface border-y border-border-ink py-18 sm:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <SectionHeading
                eyebrow="Comprehensive Coverage"
                dotClass="bg-electric"
                title="What WebForAll sees on your website"
                description="Select a category to explore how automated checks identify syntax and structural barriers across your DOM."
              />

              {/* Category Explorer Tabs */}
              <div
                className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-canvas border border-border-ink w-fit max-w-full"
                role="tablist"
                aria-label="Scanner Categories"
                onKeyDown={(e) => handleTabListKeyDown(e, categories.map((c) => c.id), activeCategory, setActiveCategory)}
              >
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`category-tab-${cat.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls="category-panel"
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface text-ink shadow-card ring-1 ring-border-ink'
                          : 'text-ink-muted hover:text-ink hover:bg-white/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-electric' : ''}`} aria-hidden="true" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Category Detail Panel */}
              <div
                id="category-panel"
                role="tabpanel"
                aria-labelledby={`category-tab-${activeCategory}`}
                tabIndex={0}
                className="rounded-3xl"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-5"
                  >
                    <div className="lg:col-span-3 bg-gradient-to-br from-canvas to-surface rounded-3xl border border-border-ink p-6 sm:p-8 space-y-5 shadow-card">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-surface font-semibold text-ink border border-border-ink">
                          rule: {currentCategoryData.exampleRule}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full font-bold border ${impactBadgeClass[currentCategoryData.exampleImpact]}`}>
                          {currentCategoryData.exampleImpact} impact
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-[1.75rem] font-extrabold text-ink leading-tight">
                        {currentCategoryData.title}
                      </h3>
                      <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
                        {currentCategoryData.desc}
                      </p>
                    </div>

                    <div className="lg:col-span-2 bg-ink rounded-3xl p-6 sm:p-8 flex flex-col shadow-elevated relative overflow-hidden">
                      <div
                        aria-hidden="true"
                        className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-electric/30 blur-3xl pointer-events-none"
                      />
                      <div className="flex items-center gap-2 pb-4 border-b border-white/10 relative">
                        <span className="flex gap-1.5" aria-hidden="true">
                          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                        </span>
                        <span className="ml-2 text-xs font-bold uppercase tracking-wider text-golden">
                          Developer remediation guidance
                        </span>
                      </div>
                      <code className="font-mono text-sm text-white/90 block break-words pt-5 leading-relaxed relative">
                        {currentCategoryData.exampleFix}
                      </code>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 2: FROM PROBLEM TO PRACTICAL FIX (BEFORE/AFTER SHOWCASE) */}
          {/* ============================================================ */}
          <section className="bg-canvas py-18 sm:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <SectionHeading
                eyebrow="Actionable Engineering"
                dotClass="bg-coral"
                title="From problem to practical fix"
                description="We don't just list violations. WebForAll explains who is impacted and provides copy-ready code solutions."
              />

              {/* Showcase Selector Tabs */}
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Accessible Code Showcase"
                onKeyDown={(e) => handleTabListKeyDown(e, showcaseIds, activeShowcase, setActiveShowcase)}
              >
                {showcaseIds.map((id, index) => {
                  const isSelected = activeShowcase === id;
                  return (
                    <button
                      key={id}
                      id={`showcase-tab-${id}`}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls="showcase-panel"
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setActiveShowcase(id)}
                      className={`inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-ink text-white border-ink shadow-card'
                          : 'bg-surface text-ink-muted hover:text-ink border-border-ink hover:border-border-strong'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-mono font-bold ${
                          isSelected ? 'bg-white/15 text-white' : 'bg-canvas text-ink-muted'
                        }`}
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      {showcases[id].label}
                    </button>
                  );
                })}
              </div>

              {/* Side-by-Side Comparison Grid */}
              <div id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${activeShowcase}`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeShowcase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-5"
                  >
                    {/* LEFT: THE BARRIER */}
                    <div className="bg-surface rounded-3xl border border-border-ink shadow-card overflow-hidden flex flex-col">
                      <div className="h-1 bg-gradient-to-r from-coral-bright to-coral" aria-hidden="true" />
                      <div className="p-6 sm:p-8 space-y-4 flex-grow flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-coral uppercase tracking-wider flex items-center gap-1.5">
                            <AlertOctagon className="w-4 h-4" aria-hidden="true" />
                            What the scanner found
                          </span>
                          <span className="text-xs font-bold text-coral bg-coral-soft px-2.5 py-0.5 rounded-full">
                            Barrier
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-ink">{currentShowcase.barrierTitle}</h3>
                        <p className="text-sm text-ink-muted leading-relaxed font-medium flex-grow">
                          {currentShowcase.barrierDesc}
                        </p>
                        <div>
                          <span className="text-xs font-bold text-ink-muted block mb-2">Problematic markup</span>
                          <pre className="font-mono text-[13px] leading-relaxed text-white/90 bg-ink p-4 rounded-2xl whitespace-pre-wrap break-words">
                            <code>{currentShowcase.barrierCode}</code>
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: THE REMEDY */}
                    <div className="bg-surface rounded-3xl border border-border-ink shadow-card overflow-hidden flex flex-col">
                      <div className="h-1 bg-gradient-to-r from-teal-bright to-teal" aria-hidden="true" />
                      <div className="p-6 sm:p-8 space-y-4 flex-grow flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            Accessible solution
                          </span>
                          <span className="text-xs font-bold text-teal bg-teal-soft px-2.5 py-0.5 rounded-full">
                            Verified Fix
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-ink">{currentShowcase.fixTitle}</h3>
                        <p className="text-sm text-ink-muted leading-relaxed font-medium flex-grow">
                          {currentShowcase.fixDesc}
                        </p>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-ink-muted block">Accessible markup</span>
                            <button
                              type="button"
                              onClick={() => copyShowcaseCode(currentShowcase.fixCode)}
                              className="inline-flex items-center text-xs font-bold text-teal bg-teal-soft px-2.5 py-1 rounded-full hover:bg-teal hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedShowcase ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                                  Copy Code
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="font-mono text-[13px] leading-relaxed text-white/90 bg-ink p-4 rounded-2xl whitespace-pre-wrap break-words">
                            <code>{currentShowcase.fixCode}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 3: ONE SCAN, A CLEARER NEXT STEP (3-STAGE NARRATIVE) */}
          {/* ============================================================ */}
          <section className="bg-surface border-t border-border-ink py-18 sm:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <SectionHeading
                eyebrow="How It Works"
                dotClass="bg-violet"
                title="One scan, a clearer next step"
                description="A transparent three-step progression from URL input to shipping verified accessibility improvements."
              />

              <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {steps.map(({ num, icon: Icon, accent, title, body }) => (
                  <li
                    key={num}
                    className="group relative p-7 bg-canvas rounded-3xl border border-border-ink space-y-4 hover:bg-surface hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${accent}`}>
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-xs font-bold text-ink-subtle tracking-wider px-2.5 py-1 rounded-full border border-border-ink bg-surface" aria-hidden="true">
                        STEP {num}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-ink">
                      <span className="sr-only">Step {num}: </span>
                      {title}
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed font-medium">{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 4: TRUST & BOUNDARIES */}
          {/* ============================================================ */}
          <section className="bg-canvas border-t border-border-ink py-18 sm:py-22">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <SectionHeading
                eyebrow="Honest Engineering Boundaries"
                dotClass="bg-golden"
                title="What automated scans do—and what they don't"
                description="We believe in transparent engineering: automated scans are an indispensable first step in continuous delivery, but cannot replace manual assistive evaluation."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="p-7 bg-surface rounded-3xl border border-border-ink space-y-4 shadow-card">
                  <div className="flex items-center gap-3 text-ink font-extrabold text-lg font-display">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-soft">
                      <CheckCircle2 className="w-5 h-5 text-teal" aria-hidden="true" />
                    </span>
                    <span>What automated testing catches reliably</span>
                  </div>
                  <ul className="space-y-2.5 text-ink-muted font-medium">
                    {[
                      'Deterministic DOM syntax (missing alt attributes, empty links, invalid ARIA).',
                      'Missing form labels and unlabelled interactive controls.',
                      'Structural tags, HTML lang attributes, and duplicate IDs.',
                    ].map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                    <li className="flex gap-2.5">
                      <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Covers approximately <strong className="text-ink">30% to 50%</strong> of potential WCAG criteria.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-7 bg-surface rounded-3xl border border-border-ink space-y-4 shadow-card">
                  <div className="flex items-center gap-3 text-ink font-extrabold text-lg font-display">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-golden-soft">
                      <AlertTriangle className="w-5 h-5 text-golden-ink" aria-hidden="true" />
                    </span>
                    <span>What requires manual human review</span>
                  </div>
                  <ul className="space-y-2.5 text-ink-muted font-medium">
                    {[
                      'Whether image descriptions are genuinely meaningful in their context.',
                      'Interactive keyboard-only navigation flows (Tab order, focus trapping).',
                      'Real assistive screen reader tasks (VoiceOver, NVDA, JAWS).',
                      'Cognitive clarity, plain language, and error recovery guidance.',
                    ].map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <Eye className="w-4 h-4 text-golden-ink flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 5: FINAL CALL TO ACTION */}
          {/* ============================================================ */}
          <section className="bg-canvas pb-18 sm:pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto bg-ink text-white rounded-[2rem] py-16 sm:py-20 px-6 relative overflow-hidden shadow-elevated">
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 left-1/4 w-[28rem] h-[28rem] rounded-full bg-electric/40 blur-[120px]" />
                <div className="absolute -bottom-40 right-1/4 w-[26rem] h-[26rem] rounded-full bg-violet/40 blur-[120px]" />
                <div className="absolute inset-0 bg-grid-subtle opacity-[0.07]" />
              </div>
              <div className="max-w-3xl mx-auto text-center space-y-6 relative">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-golden">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Start in seconds
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.08]">
                  Ready to find out what needs attention on your website?
                </h2>
                <p className="text-base sm:text-lg text-white/75 max-w-xl mx-auto font-medium">
                  Enter your URL above or try our controlled storefront fixture with known accessibility barriers.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      urlInputRef.current?.focus({ preventScroll: true });
                    }}
                    className="inline-flex items-center px-6 py-3.5 rounded-full font-bold text-base text-ink bg-white hover:bg-cream transition-colors shadow-elevated cursor-pointer focus-visible:outline-golden"
                  >
                    Scan a website now
                    <ArrowRight className="w-4 h-4 ml-2 -rotate-90" aria-hidden="true" />
                  </button>
                  <Link
                    href="/demo"
                    className="inline-flex items-center px-6 py-3.5 rounded-full font-bold text-base text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-colors focus-visible:outline-golden"
                  >
                    Try the interactive demo
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  dotClass,
  title,
  description,
}: {
  eyebrow: string;
  dotClass: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
        {eyebrow}
      </span>
      <h2 className="text-3xl sm:text-[2.75rem] font-extrabold text-ink tracking-tight leading-[1.1]">{title}</h2>
      <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">{description}</p>
    </div>
  );
}
