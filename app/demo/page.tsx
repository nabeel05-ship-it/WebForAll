'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlayCircle,
  Code,
  Eye,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  AlertOctagon,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  MousePointerClick,
  Store,
  CheckCircle2,
  Check,
  ShoppingBag,
  Search,
  ShoppingCart,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import ReportView from '@/components/ReportView';
import { AccessibilityReport } from '@/lib/scanner/types';
import { DEMO_HTML } from '@/lib/fixtures/demo-fixture';

export default function DemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active flaw in the Interactive Storefront Inspector
  const [activeFlawIndex, setActiveFlawIndex] = useState<number>(0);

  // Remediation toggle: false = show barrier fixture, true = show accessible remedy
  const [isFixMode, setIsFixMode] = useState<boolean>(false);
  const [copiedDemoCode, setCopiedDemoCode] = useState<boolean>(false);

  const copyDemoCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDemoCode(true);
      setTimeout(() => setCopiedDemoCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const plantedFlaws = [
    {
      num: '01',
      ruleId: 'image-alt',
      impact: 'Critical',
      title: 'Missing Image Alternative Text',
      target: 'img.product-hero-banner',
      userExperience:
        'Screen reader users hear only the raw image filename or an unhelpful generic "unlabelled graphic" announcement.',
      axeCheck:
        'axe-core checks that every <img> element possesses a non-empty alt attribute unless marked aria-hidden="true".',
      badgeColor: 'coral',
      icon: ImageIcon,
      codeProblem: '<img class="product-hero-banner" src="/assets/hydro-flask.jpg">',
      codeFix: '<img class="product-hero-banner" src="/assets/hydro-flask.jpg"\n  alt="Hydro Flask 32oz vacuum-insulated stainless steel water bottle">',
    },
    {
      num: '02',
      ruleId: 'label',
      impact: 'Critical',
      title: 'Unlabelled Form Input Field',
      target: '#search-store',
      userExperience:
        'Speech-input users cannot target the field by voice command; screen reader users are not told what to type.',
      axeCheck:
        'axe-core verifies that every form control has an associated permanent <label>, aria-label, or aria-labelledby.',
      badgeColor: 'coral',
      icon: CheckSquare,
      codeProblem: '<input id="search-store" type="text" name="coupon">',
      codeFix: '<label for="search-store" class="block text-xs font-bold">\n  Promo Code or Search Catalog\n</label>\n<input id="search-store" type="text" name="coupon">',
    },
    {
      num: '03',
      ruleId: 'button-name',
      impact: 'Critical',
      title: 'Icon-Only Checkout Button',
      target: 'button.checkout-submit-btn',
      userExperience:
        'Assistive software announces only "button", leaving the user unable to tell if it submits, deletes, or cancels.',
      axeCheck:
        'axe-core checks for discernible text inside button tags or explicit aria-label descriptions.',
      badgeColor: 'coral',
      icon: MousePointerClick,
      codeProblem: '<button class="btn checkout-submit-btn">\n  <svg ...></svg>\n</button>',
      codeFix: '<button class="btn checkout-submit-btn"\n  aria-label="Apply discount code">\n  <svg aria-hidden="true" ...></svg>\n  <span>Apply</span>\n</button>',
    },
    {
      num: '04',
      ruleId: 'link-name',
      impact: 'Serious',
      title: 'Icon Cart Link Without Discernible Text',
      target: 'a.cart-icon-link',
      userExperience:
        'Screen reader users hear empty link announcements when navigating through the site link catalog.',
      axeCheck:
        'axe-core checks that links contain discernible anchor text or aria-label descriptions.',
      badgeColor: 'golden',
      icon: Code,
      codeProblem: '<a class="cart-icon-link" href="/checkout/cart">\n  <svg ...></svg>\n</a>',
      codeFix: '<a class="cart-icon-link" href="/checkout/cart"\n  aria-label="View shopping cart with 0 items">\n  <svg aria-hidden="true" ...></svg>\n  <span>Cart (0)</span>\n</a>',
    },
    {
      num: '05',
      ruleId: 'heading-order',
      impact: 'Moderate',
      title: 'Skipped Heading Level Sequence',
      target: 'h4.featured-collection-heading',
      userExperience:
        'Navigating by heading keys (H, 1-6) skips directly from <h1> to <h4>, making users believe entire document sections were missed.',
      axeCheck:
        'axe-core confirms headings do not skip levels (e.g. <h1> directly to <h4> without intermediate <h2> or <h3>).',
      badgeColor: 'golden',
      icon: Layers,
      codeProblem: '<h1>Welcome to Apex Community Outfitters</h1>\n<h4 class="featured-collection-heading">\n  Limited Time Spring Clearance Sale\n</h4>',
      codeFix: '<h1>Welcome to Apex Community Outfitters</h1>\n<h2 class="featured-collection-heading">\n  Limited Time Spring Clearance Sale\n</h2>',
    },
    {
      num: '06',
      ruleId: 'region',
      impact: 'Moderate',
      title: 'Content Outside Landmark Regions',
      target: 'div.banner',
      userExperience:
        'Screen reader users who navigate by landmark regions (main, nav, banner) cannot jump to content left outside semantic regions.',
      axeCheck:
        'axe-core verifies that all perceivable content is contained within appropriate HTML5 landmark elements.',
      badgeColor: 'golden',
      icon: Store,
      codeProblem: '<div class="banner">\n  <h1>Welcome to Apex Community Outfitters</h1>\n</div>',
      codeFix: '<header role="banner" class="banner">\n  <h1>Welcome to Apex Community Outfitters</h1>\n</header>\n<main role="main">\n  ...\n</main>',
    },
  ];

  const currentFlaw = plantedFlaws[activeFlawIndex];

  const runDemoScan = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const res = await fetch('/api/demo');
      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data || !data.success) {
        throw new Error(data?.error || `Demo evaluation failed (HTTP ${res.status}). Please try again.`);
      }

      setReport(data.report);
      setIsRunning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Demo execution failed');
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen py-10 sm:py-14 bg-canvas text-ink bg-aurora bg-aurora-page overflow-x-clip">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-bold text-ink-muted hover:text-electric transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Back to Home
          </Link>
        </div>

        {/* Guided Workspace Hero */}
        <div className="bg-surface rounded-3xl border border-border-ink p-6 sm:p-8 space-y-6 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-border-subtle">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 backdrop-blur border border-border-ink shadow-glass text-violet text-xs font-bold uppercase tracking-[0.12em]">
                <Store className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Controlled Test Environment</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-ink leading-[1.08]">
                Interactive Demo Storefront
              </h1>
              <p className="text-base text-ink-muted leading-relaxed font-medium">
                Experience WebForAll against an intentional fixture (<span className="font-mono text-ink font-bold">Apex Community Outfitters</span>) containing 6 real-world accessibility barriers.
              </p>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <button
                type="button"
                onClick={runDemoScan}
                disabled={isRunning}
                className="inline-flex items-center px-6 py-3.5 rounded-xl text-base font-extrabold text-white bg-electric hover:bg-electric-hover active:bg-[#2244C9] disabled:bg-border-ink transition-all shadow-electricGlow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-electric/30 cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                    Running axe-core scan...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                    {report ? 'Re-run Demo Scan' : 'Run Demo Scan'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowCodePreview(!showCodePreview)}
                className="inline-flex items-center px-4 py-3 rounded-xl text-sm font-bold text-ink bg-canvas hover:bg-cream border border-border-ink transition-colors cursor-pointer"
              >
                <Code className="w-4 h-4 mr-1.5 text-ink-muted" aria-hidden="true" />
                {showCodePreview ? 'Hide Raw HTML' : 'View Raw HTML'}
              </button>

              <a
                href="/api/demo/preview"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-3 rounded-xl text-sm font-bold text-ink bg-canvas hover:bg-cream border border-border-ink transition-colors"
              >
                <Eye className="w-4 h-4 mr-1.5 text-ink-muted" aria-hidden="true" />
                Open Fixture
              </a>
            </div>
          </div>

          {/* Collapsible Raw HTML Inspector */}
          {showCodePreview && (
            <div className="p-4 rounded-2xl bg-canvas border border-border-ink space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-border-ink font-bold">
                <span className="font-mono text-ink">fixture: apex-storefront.html</span>
                <span className="text-coral font-mono">Contains 6 intentional WCAG barriers</span>
              </div>
              <pre
                tabIndex={0}
                aria-label="Demo storefront HTML source"
                className="overflow-x-auto text-ink text-xs max-h-72 whitespace-pre-wrap leading-relaxed font-mono p-3 bg-surface rounded-xl border border-border-ink"
              >
                <code>{DEMO_HTML}</code>
              </pre>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-coral-soft border-2 border-coral/30 text-coral text-sm font-medium">
              <div className="font-extrabold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>Demo Execution Error</span>
              </div>
              <p className="mt-1 text-ink">{error}</p>
            </div>
          )}

          {/* INTERACTIVE STOREFRONT INSPECTOR (WHEN IDLE OR BEFORE SCAN) */}
          {!report && (
            <div className="space-y-8 pt-2">
              {/* Flaw Selector Navigation */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-xl font-extrabold text-ink flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-golden-ink" />
                    Interactive Inspector: 6 Intentional Flaws
                  </h2>
                  <span className="text-xs font-bold text-ink-muted">
                    Click any flaw to focus on its element and test the remediation
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {plantedFlaws.map((flaw, idx) => {
                    const isSelected = activeFlawIndex === idx;
                    const Icon = flaw.icon;
                    return (
                      <button
                        key={flaw.num}
                        type="button"
                        onClick={() => setActiveFlawIndex(idx)}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-electric bg-electric-soft shadow-subtle scale-102'
                            : 'border-border-ink bg-canvas hover:bg-cream'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-electric font-mono">{flaw.num}</span>
                          <span
                            className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                              flaw.badgeColor === 'coral'
                                ? 'bg-coral-soft text-coral'
                                : 'bg-golden-soft text-ink'
                            }`}
                          >
                            {flaw.impact}
                          </span>
                        </div>
                        <div className="font-bold text-xs sm:text-sm text-ink truncate flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 flex-shrink-0 text-ink-muted" />
                          <span className="truncate">{flaw.ruleId}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPLIT VIEW: STOREFRONT SIMULATION (LEFT) & DIAGNOSTIC INSPECTOR (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT: LIVE STOREFRONT SIMULATION CANVAS */}
                <div className="lg:col-span-7 bg-surface rounded-2xl border border-border-ink p-5 sm:p-6 space-y-4 shadow-subtle">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-coral animate-ping" />
                      <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
                        Storefront Live Viewport
                      </span>
                    </div>

                    {/* Interactive Barrier vs Fix Toggle */}
                    <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-lg border border-border-ink text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setIsFixMode(false)}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          !isFixMode
                            ? 'bg-coral text-white shadow-subtle'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        Barrier View
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFixMode(true)}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          isFixMode
                            ? 'bg-teal text-white shadow-subtle'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        Remediated Fix
                      </button>
                    </div>
                  </div>

                  {/* Simulated Storefront Webpage Container */}
                  <div className="p-4 sm:p-6 bg-[#FAFAFC] rounded-xl border border-border-ink space-y-5 text-ink font-sans relative">
                    
                    {/* Storefront Header & Cart Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-border-ink">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-electric" />
                        <span className="font-extrabold text-sm sm:text-base text-ink">
                          Apex Community Outfitters
                        </span>
                      </div>

                      {/* Flaw 04 Target: Cart Icon Link */}
                      <div className="relative">
                        <div
                          className={`p-2 rounded-lg transition-all ${
                            activeFlawIndex === 3
                              ? 'ring-4 ring-golden ring-offset-2 bg-golden-soft'
                              : 'bg-canvas border border-border-ink'
                          }`}
                        >
                          <a
                            href="#cart"
                            onClick={(e) => e.preventDefault()}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink"
                            aria-label={isFixMode ? 'Shopping Cart with 0 items' : undefined}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {isFixMode && <span className="text-teal font-extrabold">Cart (0)</span>}
                          </a>
                        </div>
                        {activeFlawIndex === 3 && (
                          <span className="absolute -top-6 right-0 bg-golden text-ink font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            {isFixMode ? 'Fixed: link-name added' : 'Flaw: link-name missing'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Flaw 01 & Flaw 05 / 06 Target: Banner Area */}
                    <div
                      className={`p-4 rounded-xl transition-all ${
                        activeFlawIndex === 5 || activeFlawIndex === 4
                          ? isFixMode
                            ? 'border-2 border-teal bg-teal-soft/30'
                            : 'border-2 border-dashed border-coral bg-coral-soft/30'
                          : 'bg-[#E2E8F0]/50'
                      }`}
                    >
                      <h1 className="text-base sm:text-lg font-extrabold text-ink">
                        Welcome to Apex Community Outfitters
                      </h1>

                      {/* Heading Order: h4 in barrier vs h2 in remediated */}
                      {isFixMode ? (
                        <h2 className="text-xs sm:text-sm font-bold text-teal mt-1 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>&lt;h2&gt; Limited Time Spring Clearance Sale</span>
                        </h2>
                      ) : (
                        <h4 className="text-xs sm:text-sm font-bold text-ink mt-1 flex items-center gap-1">
                          {activeFlawIndex === 4 && (
                            <span className="px-1.5 py-0.5 rounded bg-golden text-ink text-[10px] font-mono font-bold">
                              &lt;h4&gt; skipped &lt;h2&gt; &amp; &lt;h3&gt;
                            </span>
                          )}
                          <span>Limited Time Spring Clearance Sale</span>
                        </h4>
                      )}

                      {activeFlawIndex === 5 && (
                        <div className="mt-2 text-[11px] font-mono font-bold">
                          {isFixMode ? (
                            <span className="text-teal bg-surface px-2 py-0.5 rounded border border-teal/30">
                              Wrapped in &lt;header role=&quot;banner&quot;&gt; &amp; &lt;main&gt;
                            </span>
                          ) : (
                            <span className="text-coral bg-surface px-2 py-0.5 rounded border border-coral/30">
                              Flaw: &lt;div class=&quot;banner&quot;&gt; outside landmark regions
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Flaw 01 Target: Product Hero Image */}
                    <div className="space-y-3">
                      <div className="relative inline-block w-full">
                        <div
                          className={`rounded-xl overflow-hidden border-2 transition-all p-1 bg-surface ${
                            activeFlawIndex === 0
                              ? isFixMode
                                ? 'border-teal ring-4 ring-teal/20'
                                : 'border-coral ring-4 ring-coral/20'
                              : 'border-border-ink'
                          }`}
                        >
                          <div className="w-full h-36 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center rounded-lg relative overflow-hidden">
                            <span className="text-xs font-mono text-ink-muted">
                              [Product Photo: Hydro Flask Bottle]
                            </span>
                          </div>
                        </div>

                        {activeFlawIndex === 0 && (
                          <div className="mt-1 text-[11px] font-mono font-bold">
                            {isFixMode ? (
                              <span className="text-teal bg-teal-soft px-2 py-0.5 rounded border border-teal/30 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                alt=&quot;Hydro Flask 32oz vacuum-insulated bottle&quot;
                              </span>
                            ) : (
                              <span className="text-coral bg-coral-soft px-2 py-0.5 rounded border border-coral/30 inline-flex items-center gap-1">
                                <AlertOctagon className="w-3 h-3" />
                                &lt;img&gt; missing alt attribute
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-xs font-bold text-ink">
                        Premium Outdoor Hydro Flask Water Bottle &bull; $34.00
                      </p>
                    </div>

                    {/* Flaw 02 & Flaw 03 Target: Input and Button */}
                    <div className="space-y-2 pt-2 border-t border-border-ink">
                      {isFixMode && (
                        <label
                          htmlFor="demo-search-input"
                          className="block text-xs font-extrabold text-teal flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>&lt;label for=&quot;search-store&quot;&gt; Promo Code or Search:</span>
                        </label>
                      )}

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            id="demo-search-input"
                            type="text"
                            placeholder="Enter promo coupon..."
                            className={`w-full px-3 py-2 text-xs font-mono rounded-lg border-2 bg-surface text-ink focus:outline-none transition-all ${
                              activeFlawIndex === 1
                                ? isFixMode
                                  ? 'border-teal ring-2 ring-teal/30'
                                  : 'border-coral ring-2 ring-coral/30'
                                : 'border-border-ink'
                            }`}
                          />
                          {activeFlawIndex === 1 && !isFixMode && (
                            <span className="absolute -bottom-5 left-0 text-[10px] text-coral font-mono font-bold">
                              Missing &lt;label&gt; element
                            </span>
                          )}
                        </div>

                        {/* Flaw 03 Button */}
                        <div className="relative">
                          <button
                            type="button"
                            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              activeFlawIndex === 2
                                ? isFixMode
                                  ? 'bg-teal text-white ring-4 ring-teal/20'
                                  : 'bg-[#0284c7] text-white ring-4 ring-coral ring-offset-2'
                                : 'bg-[#0284c7] text-white'
                            }`}
                            aria-label={isFixMode ? 'Apply discount code' : undefined}
                          >
                            <Search className="w-3.5 h-3.5" />
                            {isFixMode && <span>Apply</span>}
                          </button>
                          {activeFlawIndex === 2 && !isFixMode && (
                            <span className="absolute -bottom-5 right-0 text-[10px] text-coral font-mono font-bold whitespace-nowrap">
                              Icon only, no name
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: DIAGNOSTIC INSPECTOR CARD */}
                <div className="lg:col-span-5 bg-cream rounded-2xl border border-border-ink p-5 sm:p-6 space-y-4 shadow-subtle">
                  <div className="flex items-center justify-between pb-3 border-b border-golden/30">
                    <span className="font-mono text-xs font-extrabold text-electric bg-surface px-2.5 py-1 rounded-md border border-border-ink">
                      Target: {currentFlaw.target}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        currentFlaw.badgeColor === 'coral'
                          ? 'bg-coral-soft text-coral'
                          : 'bg-golden-soft text-ink'
                      }`}
                    >
                      {currentFlaw.impact} Issue
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-ink">
                      Flaw {currentFlaw.num}: {currentFlaw.title}
                    </h3>
                    <p className="text-xs text-ink-muted font-medium">
                      Rule: <code className="font-mono text-electric font-bold">{currentFlaw.ruleId}</code>
                    </p>
                  </div>

                  {/* Impact & axe-core check details */}
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-surface rounded-xl border border-border-ink space-y-1">
                      <span className="font-extrabold text-coral uppercase tracking-wider block text-[11px]">
                        End-User Impact:
                      </span>
                      <p className="text-ink-muted leading-relaxed font-medium">
                        {currentFlaw.userExperience}
                      </p>
                    </div>

                    <div className="p-3 bg-surface rounded-xl border border-border-ink space-y-1">
                      <span className="font-extrabold text-teal uppercase tracking-wider block text-[11px]">
                        axe-core Diagnostic:
                      </span>
                      <p className="text-ink-muted leading-relaxed font-medium">
                        {currentFlaw.axeCheck}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Code Comparison */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                      <span>{isFixMode ? 'Remediated Accessible Code:' : 'Problematic Fixture Code:'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyDemoCode(isFixMode ? currentFlaw.codeFix : currentFlaw.codeProblem)}
                          className="text-xs text-ink bg-surface px-2 py-0.5 rounded border border-border-ink hover:text-electric transition-colors inline-flex items-center gap-1 font-sans cursor-pointer"
                        >
                          {copiedDemoCode ? (
                            <>
                              <Check className="w-3 h-3 text-teal" />
                              <span className="text-teal font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Code className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFixMode(!isFixMode)}
                          className="text-electric hover:underline text-xs cursor-pointer"
                        >
                          {isFixMode ? 'Switch to Barrier' : 'Switch to Fix'}
                        </button>
                      </div>
                    </div>

                    <pre className="font-mono text-[11px] p-3 rounded-xl bg-surface border border-border-ink whitespace-pre-wrap break-words text-ink">
                      <code>{isFixMode ? currentFlaw.codeFix : currentFlaw.codeProblem}</code>
                    </pre>
                  </div>

                  {/* Scan Prompt */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={runDemoScan}
                      disabled={isRunning}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-electric hover:bg-electric-hover transition-colors shadow-subtle cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 mr-1.5" />
                      Run Full axe-core Scan on Fixture
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area: ReportView on Execution */}
        {report && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-teal-soft rounded-2xl border-2 border-teal/30 text-ink">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                <span className="font-bold text-sm sm:text-base">
                  Demo Evaluation Complete — {report.summary.totalViolations} Intentional Barriers Identified by axe-core
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReport(null)}
                  className="text-xs sm:text-sm font-bold text-ink-muted hover:text-ink bg-surface px-3 py-1.5 rounded-lg border border-border-ink"
                >
                  &larr; Back to Inspector
                </button>
                <Link
                  href="/#scanner"
                  className="text-xs sm:text-sm font-extrabold text-electric hover:underline"
                >
                  Scan your own site &rarr;
                </Link>
              </div>
            </div>

            <ReportView
              report={report}
              onReset={() => setReport(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
