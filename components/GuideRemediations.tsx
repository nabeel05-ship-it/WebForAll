'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, AlertOctagon, CheckCircle2, Sparkles } from 'lucide-react';
import { cardHoverVariants, cardTapVariants } from '@/lib/motion';

interface CodeFixItem {
  id: string;
  num: string;
  title: string;
  description: string;
  problematicCode: string;
  problematicLabel: string;
  accessibleCode: string;
  accessibleLabel: string;
  explanation: string;
}

const FIXES: CodeFixItem[] = [
  {
    id: 'alt-text',
    num: '01',
    title: 'Missing Alternative Text on Informative Images',
    description:
      'Images without an alt attribute cannot be perceived by screen reader users, who hear only raw filenames or "unlabelled graphic".',
    problematicCode: '<img src="quarterly-chart.png">',
    problematicLabel: 'Problematic Pattern',
    accessibleCode: '<img src="quarterly-chart.png" alt="Quarterly revenue growth bar chart">',
    accessibleLabel: 'Accessible Pattern',
    explanation: 'Decorative images should use alt="" to be safely ignored. Informative images require concise descriptions.',
  },
  {
    id: 'form-labels',
    num: '02',
    title: 'Form Inputs Relying Solely on Placeholders',
    description:
      'Placeholders vanish upon typing and are frequently skipped by screen readers. Every input requires an explicit programmatic label.',
    problematicCode: '<input type="email" placeholder="Enter your email">',
    problematicLabel: 'Problematic Pattern',
    accessibleCode: '<label for="user-email">Email Address</label>\n<input id="user-email" type="email" autocomplete="email">',
    accessibleLabel: 'Accessible Pattern',
    explanation: 'The <label for="id"> pairing guarantees screen readers announce the field name and enlarges the clickable tap target.',
  },
  {
    id: 'button-names',
    num: '03',
    title: 'Icon-Only Buttons Without Accessible Names',
    description:
      'Buttons containing only an SVG or icon font have no accessible name. Screen readers announce only "button" without explaining its purpose.',
    problematicCode: '<button>\n  <svg class="icon-trash" />\n</button>',
    problematicLabel: 'Problematic Pattern',
    accessibleCode: '<button aria-label="Delete item">\n  <svg aria-hidden="true" />\n</button>',
    accessibleLabel: 'Accessible Pattern',
    explanation: 'Always supply aria-label on the button and mark visual SVGs with aria-hidden="true" to prevent redundant announcements.',
  },
  {
    id: 'color-contrast',
    num: '04',
    title: 'Insufficient Text Color Contrast Ratio',
    description:
      'Low contrast prevents people with low vision or situational glare from reading text. Maintain at least 4.5:1 contrast for normal body text and 3:1 for large text.',
    problematicCode: '/* Contrast 2.1:1 — Fails WCAG AA */\ncolor: #94a3b8;\nbackground: #ffffff;',
    problematicLabel: 'Low Contrast (2.1:1)',
    accessibleCode: '/* Contrast 7.2:1 — Exceeds WCAG AAA */\ncolor: #18233A;\nbackground: #ffffff;',
    accessibleLabel: 'AAA Compliant (7.2:1)',
    explanation: 'Never rely on low-opacity text or pale pastels for essential body copy. Test with WebForAll or an eye-dropper contrast calculator.',
  },
  {
    id: 'focus-outlines',
    num: '05',
    title: 'Removed Keyboard Focus Outlines',
    description:
      'Applying outline: none without an accessible replacement leaves keyboard and switch users unable to locate focus on the page.',
    problematicCode: '/* Breaks keyboard navigation */\n*:focus {\n  outline: none;\n}',
    problematicLabel: 'Focus Removed',
    accessibleCode: '/* Visible, high-contrast focus ring */\n*:focus-visible {\n  outline: 3px solid #3157E8;\n  outline-offset: 2px;\n}',
    accessibleLabel: 'Focus Preserved',
    explanation: 'Use :focus-visible so mouse users do not see outlines upon clicking, while keyboard Tab users enjoy crisp visible rings.',
  },
];

export default function GuideRemediations() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {FIXES.map((fix) => {
        const isCopied = copiedId === fix.id;
        return (
          <motion.article
            key={fix.id}
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap={cardTapVariants.tap}
            className="p-6 sm:p-7 rounded-2xl bg-surface border border-border-ink space-y-4 shadow-subtle hover:border-electric/40 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-extrabold text-coral bg-coral-soft px-2.5 py-1 rounded-md border border-coral/30">
                  {fix.num}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-ink">{fix.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(fix.id, fix.accessibleCode)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all self-start sm:self-auto cursor-pointer ${
                  isCopied
                    ? 'bg-teal-soft text-teal border border-teal/40'
                    : 'bg-canvas hover:bg-cream text-ink-muted hover:text-ink border border-border-ink'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-teal" aria-hidden="true" />
                    <span>Copied!</span>
                    <span className="sr-only"> accessible code fix for {fix.title}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy Fix</span>
                    <span className="sr-only"> for {fix.title}</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-medium">
              {fix.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono text-xs pt-1">
              {/* Problematic */}
              <div className="p-4 rounded-xl bg-coral-soft border border-coral/30 space-y-2">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[11px] uppercase font-extrabold text-coral flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5" aria-hidden="true" />
                    {fix.problematicLabel}
                  </span>
                </div>
                <pre className="text-ink font-mono text-xs whitespace-pre-wrap overflow-x-auto leading-relaxed bg-surface/60 p-2.5 rounded-lg border border-coral/20">
                  <code>{fix.problematicCode}</code>
                </pre>
              </div>

              {/* Accessible */}
              <div className="p-4 rounded-xl bg-teal-soft border border-teal/30 space-y-2">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[11px] uppercase font-extrabold text-teal flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {fix.accessibleLabel}
                  </span>
                </div>
                <pre className="text-ink font-mono text-xs whitespace-pre-wrap overflow-x-auto leading-relaxed bg-surface/60 p-2.5 rounded-lg border border-teal/20">
                  <code>{fix.accessibleCode}</code>
                </pre>
              </div>
            </div>

            <div className="pt-1 text-xs text-ink-muted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet flex-shrink-0" aria-hidden="true" />
              <span>{fix.explanation}</span>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
