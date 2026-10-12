'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Code2,
  Copy,
  Check,
  Eye,
  ArrowRight,
  ShieldCheck,
  MousePointerClick,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { easeSmooth, fadeInVariants } from '@/lib/motion';

interface InspectionNode {
  id: string;
  name: string;
  landmark: string;
  selector: string;
  status: 'critical' | 'serious' | 'pass';
  ruleId: string;
  wcagCriterion: string;
  impactLabel: string;
  affectedUsers: string;
  problematicCode: string;
  remediatedCode: string;
  explanation: string;
}

const INSPECTION_NODES: InspectionNode[] = [
  {
    id: 'node-button',
    name: 'Cart Action Button',
    landmark: '<main> Landmark',
    selector: 'button.checkout-btn',
    status: 'critical',
    ruleId: 'button-name',
    wcagCriterion: 'WCAG 4.1.2 Name, Role, Value',
    impactLabel: 'Critical Barrier',
    affectedUsers: 'Screen reader users hear only "button", unable to confirm the action.',
    problematicCode: '<button class="checkout-btn">\n  <svg class="cart-icon" />\n</button>',
    remediatedCode: '<button class="checkout-btn"\n  aria-label="Add item to shopping cart">\n  <svg class="cart-icon" aria-hidden="true" />\n  <span>Add to Cart</span>\n</button>',
    explanation: 'Supplying an explicit accessible name (via aria-label or visible text) and marking decorative SVGs with aria-hidden="true" ensures VoiceOver and NVDA announce the button purpose.',
  },
  {
    id: 'node-image',
    name: 'Product Feature Banner',
    landmark: '<section class="hero">',
    selector: 'img.product-hero',
    status: 'critical',
    ruleId: 'image-alt',
    wcagCriterion: 'WCAG 1.1.1 Non-text Content',
    impactLabel: 'Critical Barrier',
    affectedUsers: 'Assistive speech reads raw image URLs or "unlabelled graphic".',
    problematicCode: '<img src="/assets/q3-growth.png"\n  class="product-hero">',
    remediatedCode: '<img src="/assets/q3-growth.png"\n  class="product-hero"\n  alt="Q3 revenue growth chart showing 14% increase">',
    explanation: 'Informative graphics require concise alternative text describing visual meaning. Purely decorative elements should specify empty alt="" so they are safely skipped.',
  },
  {
    id: 'node-contrast',
    name: 'Product Description Copy',
    landmark: '<article class="details">',
    selector: 'p.specs-copy',
    status: 'serious',
    ruleId: 'color-contrast',
    wcagCriterion: 'WCAG 1.4.3 Contrast (Minimum)',
    impactLabel: 'Serious Barrier',
    affectedUsers: 'Low-vision users and users in bright sunlight cannot read pale text.',
    problematicCode: '/* Contrast 2.1:1 — Fails WCAG AA */\ncolor: #94A3B8;\nbackground: #FFFFFF;',
    remediatedCode: '/* Contrast 7.2:1 — Exceeds WCAG AAA */\ncolor: #18233A;\nbackground: #FFFFFF;',
    explanation: 'Body typography must achieve at least a 4.5:1 luminance contrast ratio against its background to ensure clear legibility across devices and lighting conditions.',
  },
  {
    id: 'node-landmark',
    name: 'Document Structure',
    landmark: 'Top-Level Landmark',
    selector: 'main#main-content',
    status: 'pass',
    ruleId: 'landmark-one-main',
    wcagCriterion: 'WCAG 1.3.1 Info & Relationships',
    impactLabel: 'Passed Rule',
    affectedUsers: 'Keyboard & screen reader users can skim directly to primary content.',
    problematicCode: '<!-- Missing <main> container -->\n<div class="content-wrapper">...</div>',
    remediatedCode: '<main id="main-content" tabindex="-1">\n  <!-- Primary page content -->\n</main>',
    explanation: 'A single, properly designated <main> landmark allows assistive technology users to jump past headers and repetitive navigation with a single shortcut key.',
  },
];

export default function AccessibilityScanVisualization() {
  const [activeNodeId, setActiveNodeId] = useState<string>('node-button');
  const [activeStage, setActiveStage] = useState<'inspect' | 'classify' | 'remediate'>('inspect');
  const [copiedCode, setCopiedCode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const activeNode = INSPECTION_NODES.find((n) => n.id === activeNodeId) || INSPECTION_NODES[0];

  const handleCopyCode = async (codeStr: string) => {
    try {
      await navigator.clipboard.writeText(codeStr);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-surface rounded-2xl border-2 border-border-ink p-5 sm:p-7 space-y-6 shadow-card relative overflow-hidden text-left">
      {/* Visualizer Top Bar: Technical Window Frame */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-coral/80" />
            <span className="w-3 h-3 rounded-full bg-golden/80" />
            <span className="w-3 h-3 rounded-full bg-teal/80" />
          </div>
          <span className="font-mono text-xs font-bold text-ink-muted pl-1">
            inspect://storefront.example.internal/checkout
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas border border-border-ink text-ink font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" aria-hidden="true" />
            Educational Model &bull; axe-core 4.14
          </span>
        </div>
      </div>

      {/* Narrative Pipeline Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-canvas rounded-xl border border-border-ink text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="text-ink-muted uppercase tracking-wider text-[11px]">Pipeline Flow:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveStage('inspect')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeStage === 'inspect'
                  ? 'bg-electric text-white shadow-subtle'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              1. DOM Inspection
            </button>
            <ArrowRight className="w-3 h-3 text-ink-muted" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setActiveStage('classify')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeStage === 'classify'
                  ? 'bg-coral text-white shadow-subtle'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              2. Barrier Classification
            </button>
            <ArrowRight className="w-3 h-3 text-ink-muted" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setActiveStage('remediate')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeStage === 'remediate'
                  ? 'bg-teal text-white shadow-subtle'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              3. Verified Code Fix
            </button>
          </div>
        </div>
        <span className="text-[11px] text-ink-muted hidden md:inline">
          Click any inspection node below to trace
        </span>
      </div>

      {/* Main Split Grid: Mock DOM Page (Left) & Live Remediation Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Mock DOM Browser Window with Interactive Inspection Probes */}
        <div className="lg:col-span-6 bg-canvas rounded-xl border-2 border-border-ink p-4 space-y-3 relative overflow-hidden">
          {/* Subtle Scanning Beam (Animated unless reduced motion) */}
          {!prefersReducedMotion && (
            <motion.div
              aria-hidden="true"
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [0, 240, 0],
                opacity: [0.15, 0.45, 0.15],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-electric to-transparent pointer-events-none shadow-[0_0_12px_rgba(49,87,232,0.6)] z-20"
            />
          )}

          {/* Browser Sub-Header */}
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted pb-2 border-b border-border-subtle">
            <span className="flex items-center gap-1.5 font-bold text-ink">
              <Layers className="w-3.5 h-3.5 text-electric" />
              Document Object Model (DOM) Tree
            </span>
            <span className="text-teal font-bold">JSDOM Sandboxed</span>
          </div>

          {/* Landmark Region 1: Header */}
          <div className="p-3 bg-surface rounded-lg border border-border-ink space-y-1 text-xs">
            <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted">
              <span>&lt;header role=&quot;banner&quot;&gt;</span>
              <span className="text-teal font-bold">Landmark OK</span>
            </div>
            <div className="flex items-center justify-between pl-2">
              <span className="font-bold text-ink text-xs">Storefront Header & Navigation</span>
              <span className="text-[10px] bg-canvas px-2 py-0.5 rounded border border-border-subtle font-mono text-ink-muted">
                &lt;nav&gt; skip-link
              </span>
            </div>
          </div>

          {/* Landmark Region 2: Main Content with Probed Target Nodes */}
          <div className="p-3 bg-surface rounded-lg border-2 border-electric/30 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-electric font-bold">&lt;main id=&quot;main-content&quot;&gt;</span>
              <span className="text-electric font-bold bg-electric-soft px-1.5 py-0.5 rounded">
                Active Inspection Zone
              </span>
            </div>

            {/* Target Node 1: Unlabelled Button */}
            <button
              type="button"
              onClick={() => {
                setActiveNodeId('node-button');
                setActiveStage('classify');
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                activeNodeId === 'node-button'
                  ? 'border-coral bg-coral-soft/50 shadow-subtle ring-2 ring-coral/20'
                  : 'border-border-ink bg-canvas hover:border-coral/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-coral animate-ping flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-ink block">
                    1. Cart Checkout Action
                  </span>
                  <code className="text-[11px] font-mono text-coral font-bold block">
                    button.checkout-btn
                  </code>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-coral-soft text-coral border border-coral/30">
                Critical Issue
              </span>
            </button>

            {/* Target Node 2: Missing Image Alt */}
            <button
              type="button"
              onClick={() => {
                setActiveNodeId('node-image');
                setActiveStage('classify');
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                activeNodeId === 'node-image'
                  ? 'border-coral bg-coral-soft/50 shadow-subtle ring-2 ring-coral/20'
                  : 'border-border-ink bg-canvas hover:border-coral/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-coral flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-ink block">
                    2. Product Feature Banner
                  </span>
                  <code className="text-[11px] font-mono text-coral font-bold block">
                    img.product-hero (missing alt)
                  </code>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-coral-soft text-coral border border-coral/30">
                Critical Issue
              </span>
            </button>

            {/* Target Node 3: Low Contrast Copy */}
            <button
              type="button"
              onClick={() => {
                setActiveNodeId('node-contrast');
                setActiveStage('classify');
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                activeNodeId === 'node-contrast'
                  ? 'border-golden bg-golden-soft/50 shadow-subtle ring-2 ring-golden/20'
                  : 'border-border-ink bg-canvas hover:border-golden/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-golden flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-ink block">
                    3. Specifications Description
                  </span>
                  <code className="text-[11px] font-mono text-[#D97706] font-bold block">
                    p.specs-copy (contrast: 2.1:1)
                  </code>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-golden-soft text-ink border border-golden/40">
                Serious Issue
              </span>
            </button>

            {/* Target Node 4: Passed Landmark */}
            <button
              type="button"
              onClick={() => {
                setActiveNodeId('node-landmark');
                setActiveStage('remediate');
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                activeNodeId === 'node-landmark'
                  ? 'border-teal bg-teal-soft/50 shadow-subtle ring-2 ring-teal/20'
                  : 'border-border-ink bg-canvas hover:border-teal/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-ink block">
                    4. Semantic Landmark Region
                  </span>
                  <code className="text-[11px] font-mono text-teal font-bold block">
                    main#main-content
                  </code>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-soft text-teal border border-teal/30">
                Rule Passed
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT: Live Remediation & Classification Inspector Panel */}
        <div className="lg:col-span-6 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.id}
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-cream rounded-2xl border-2 border-border-ink p-5 sm:p-6 space-y-4 shadow-subtle"
            >
              {/* Finding Title & Severity Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-golden/30">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono font-bold text-ink-muted">
                    {activeNode.landmark} &bull; Selector: {activeNode.selector}
                  </span>
                  <h3 className="text-lg font-extrabold text-ink">
                    {activeNode.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                      activeNode.status === 'critical'
                        ? 'bg-coral-soft text-coral border-coral/30'
                        : activeNode.status === 'serious'
                        ? 'bg-golden-soft text-ink border-golden/40'
                        : 'bg-teal-soft text-teal border-teal/30'
                    }`}
                  >
                    {activeNode.impactLabel}
                  </span>
                </div>
              </div>

              {/* Rule & Standard Attribution */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-surface rounded-lg border border-border-ink">
                  <span className="text-[10px] text-ink-muted font-sans font-bold block">axe-core Rule:</span>
                  <span className="text-electric font-bold">{activeNode.ruleId}</span>
                </div>
                <div className="p-2.5 bg-surface rounded-lg border border-border-ink">
                  <span className="text-[10px] text-ink-muted font-sans font-bold block">WCAG Standard:</span>
                  <span className="text-ink font-bold">{activeNode.wcagCriterion}</span>
                </div>
              </div>

              {/* Who is Affected */}
              <div className="p-3 bg-surface rounded-xl border border-border-ink space-y-1">
                <span className="text-[11px] font-bold text-violet uppercase tracking-wider block">
                  Human Impact:
                </span>
                <p className="text-xs text-ink-muted leading-relaxed font-medium">
                  {activeNode.affectedUsers}
                </p>
              </div>

              {/* Before/After Code Remediation Diff */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">
                    Remediation Code Comparison:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(activeNode.remediatedCode)}
                    className="inline-flex items-center text-xs font-bold text-teal bg-surface px-2.5 py-1 rounded-md border border-teal/25 hover:bg-teal-soft transition-colors cursor-pointer"
                    title="Copy accessible code fix"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-teal" />
                        <span className="text-teal font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1 text-teal" />
                        Copy Verified Fix
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Problematic Line */}
                  <div className="rounded-lg bg-coral-soft/70 border border-coral/30 p-2.5 text-xs font-mono">
                    <span className="text-[10px] font-bold uppercase text-coral font-sans block mb-0.5">
                      Problematic Pattern:
                    </span>
                    <pre className="text-coral font-bold overflow-x-auto whitespace-pre-wrap">
                      <code>{activeNode.problematicCode}</code>
                    </pre>
                  </div>

                  {/* Remediated Accessible Line */}
                  <div className="rounded-lg bg-teal-soft border border-teal/30 p-2.5 text-xs font-mono">
                    <span className="text-[10px] font-bold uppercase text-teal font-sans block mb-0.5">
                      Accessible Verified Fix:
                    </span>
                    <pre className="text-teal font-bold overflow-x-auto whitespace-pre-wrap">
                      <code>{activeNode.remediatedCode}</code>
                    </pre>
                  </div>
                </div>

                <p className="text-[11px] text-ink-muted italic pt-1">
                  &bull; {activeNode.explanation}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
