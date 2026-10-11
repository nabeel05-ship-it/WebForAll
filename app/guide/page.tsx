import React from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight, CheckCircle2, AlertOctagon, Eye, MousePointer, BookOpen, Layers, Sparkles } from 'lucide-react';
import InteractiveA11yLab from '@/components/InteractiveA11yLab';

export const metadata = {
  title: 'Accessibility Field Guide — WebForAll',
  description:
    'An engaging developer field guide covering WCAG POUR principles, interactive accessibility testing lab, top digital barriers, and actionable code fixes.',
};

export default function GuidePage() {
  return (
    <div className="min-h-screen py-10 sm:py-16 bg-canvas text-ink">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <header className="space-y-4 pb-8 border-b border-border-ink">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-soft border border-violet/30 text-violet text-xs font-extrabold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Developer Handbook & Field Guide</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight leading-tight">
            Web Accessibility Field Guide
          </h1>
          <p className="text-lg sm:text-xl text-ink-muted leading-relaxed font-medium max-w-2xl">
            Practical principles, code remediation patterns, and testing boundaries for building inclusive web software.
          </p>

          {/* Quick Jump Section Navigation */}
          <nav aria-label="Guide Sections" className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-ink-muted">
            <span className="text-ink">Sections:</span>
            <a href="#overview" className="text-electric hover:underline">Overview</a>
            <span>&bull;</span>
            <a href="#pour" className="text-electric hover:underline">POUR Principles</a>
            <span>&bull;</span>
            <a href="#interactive-lab" className="text-electric hover:underline font-extrabold text-violet">Interactive Lab</a>
            <span>&bull;</span>
            <a href="#fixes" className="text-electric hover:underline">Top 5 Barriers & Fixes</a>
            <span>&bull;</span>
            <a href="#scope" className="text-electric hover:underline">Automated vs Manual</a>
            <span>&bull;</span>
            <a href="#standards" className="text-electric hover:underline">Standards</a>
          </nav>
        </header>

        {/* SECTION 1: WHAT IS ACCESSIBILITY */}
        <section id="overview" className="space-y-4" aria-labelledby="heading-overview">
          <h2 id="heading-overview" className="text-2xl sm:text-3xl font-extrabold text-ink">
            What is Web Accessibility?
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
            Web accessibility (often abbreviated as <strong>a11y</strong>) ensures that websites and digital tools can be used by everyone, including people with auditory, cognitive, neurological, physical, speech, and visual disabilities.
          </p>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
            Accessible design benefits all users: clean HTML structure improves search indexing, clear contrast aids mobile use in direct sunlight, and keyboard navigation supports power users and assistive switch devices alike.
          </p>
        </section>

        {/* SECTION 2: THE FOUR POUR PRINCIPLES IN 4 DISTINCT VIVID ZONES */}
        <section id="pour" className="space-y-6 pt-6 border-t border-border-ink" aria-labelledby="heading-pour">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-violet">
              W3C Foundations
            </span>
            <h2 id="heading-pour" className="text-2xl sm:text-3xl font-extrabold text-ink">
              The Four POUR Principles
            </h2>
            <p className="text-sm sm:text-base text-ink-muted font-medium">
              The Web Content Accessibility Guidelines (WCAG) are organized around four core pillars:
            </p>
          </div>

          <div className="space-y-5 pt-2">
            {/* 1. Perceivable — Coral Zone */}
            <div className="p-6 sm:p-7 rounded-2xl bg-coral-soft border-2 border-coral/30 space-y-2.5 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-coral uppercase tracking-wider bg-surface px-2.5 py-1 rounded-md border border-coral/20">
                  Principle 01
                </span>
                <Eye className="w-5 h-5 text-coral" />
              </div>
              <h3 className="text-xl font-extrabold text-ink">1. Perceivable</h3>
              <p className="text-base text-ink leading-relaxed font-medium">
                Information cannot be invisible to all of a user&apos;s senses. Provide text alternatives for images, captions for audio, and sufficient color contrast against background surfaces.
              </p>
            </div>

            {/* 2. Operable — Golden Yellow Zone */}
            <div className="p-6 sm:p-7 rounded-2xl bg-golden-soft border-2 border-golden/40 space-y-2.5 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-ink uppercase tracking-wider bg-surface px-2.5 py-1 rounded-md border border-golden/30">
                  Principle 02
                </span>
                <MousePointer className="w-5 h-5 text-golden" />
              </div>
              <h3 className="text-xl font-extrabold text-ink">2. Operable</h3>
              <p className="text-base text-ink leading-relaxed font-medium">
                Navigation and interface controls must be operable via keyboard alone. Users must never be trapped in a control or rushed by unadjustable time limits.
              </p>
            </div>

            {/* 3. Understandable — Violet Zone */}
            <div className="p-6 sm:p-7 rounded-2xl bg-violet-soft border-2 border-violet/30 space-y-2.5 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-violet uppercase tracking-wider bg-surface px-2.5 py-1 rounded-md border border-violet/20">
                  Principle 03
                </span>
                <BookOpen className="w-5 h-5 text-violet" />
              </div>
              <h3 className="text-xl font-extrabold text-ink">3. Understandable</h3>
              <p className="text-base text-ink leading-relaxed font-medium">
                Information and UI operations must be clear. Navigation should be predictable, forms must clearly label required fields, and errors must provide actionable recovery steps.
              </p>
            </div>

            {/* 4. Robust — Teal Zone */}
            <div className="p-6 sm:p-7 rounded-2xl bg-teal-soft border-2 border-teal/30 space-y-2.5 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-teal uppercase tracking-wider bg-surface px-2.5 py-1 rounded-md border border-teal/20">
                  Principle 04
                </span>
                <Layers className="w-5 h-5 text-teal" />
              </div>
              <h3 className="text-xl font-extrabold text-ink">4. Robust</h3>
              <p className="text-base text-ink leading-relaxed font-medium">
                Content must be compatible with current and evolving user agents, browsers, and assistive technologies through standard, valid HTML markup.
              </p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE ACCESSIBILITY LAB */}
        <section id="interactive-lab" className="space-y-6 pt-6 border-t border-border-ink" aria-labelledby="heading-interactive-lab">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-violet">
              Hands-On Simulation
            </span>
            <h2 id="heading-interactive-lab" className="text-2xl sm:text-3xl font-extrabold text-ink">
              Interactive Accessibility Sandbox
            </h2>
            <p className="text-sm sm:text-base text-ink-muted font-medium">
              Experience the direct difference accessible markup makes for assistive technologies and human perception.
            </p>
          </div>

          <InteractiveA11yLab />
        </section>

        {/* SECTION 3: TOP 5 BARRIERS & CODE REMEDIES */}
        <section id="fixes" className="space-y-6 pt-6 border-t border-border-ink" aria-labelledby="heading-fixes">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-coral">
              Code Remedies
            </span>
            <h2 id="heading-fixes" className="text-2xl sm:text-3xl font-extrabold text-ink">
              Top 5 Common Barriers & Developer Code Fixes
            </h2>
            <p className="text-sm sm:text-base text-ink-muted font-medium">
              Practical patterns to eliminate the most pervasive accessibility defects.
            </p>
          </div>

          <div className="space-y-8 pt-2">
            {/* Fix 1 */}
            <article className="p-6 rounded-2xl bg-surface border-2 border-border-ink space-y-3 shadow-subtle">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-extrabold text-coral bg-coral-soft px-2.5 py-1 rounded-md border border-coral/30">
                  01
                </span>
                <h3 className="text-lg font-extrabold text-ink">
                  Missing Alternative Text on Informative Images
                </h3>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed font-medium">
                Images without an <code className="font-mono text-ink font-bold">alt</code> attribute cannot be perceived by screen reader users, who hear only raw filenames or &quot;unlabelled graphic&quot;.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-coral-soft border border-coral/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-coral block font-sans">Problematic Pattern</span>
                  <code className="text-ink">&lt;img src=&quot;quarterly-chart.png&quot;&gt;</code>
                </div>
                <div className="p-3.5 rounded-xl bg-teal-soft border border-teal/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-teal block font-sans">Accessible Pattern</span>
                  <code className="text-ink">&lt;img src=&quot;quarterly-chart.png&quot; alt=&quot;Quarterly revenue growth bar chart&quot;&gt;</code>
                </div>
              </div>
            </article>

            {/* Fix 2 */}
            <article className="p-6 rounded-2xl bg-surface border-2 border-border-ink space-y-3 shadow-subtle">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-extrabold text-coral bg-coral-soft px-2.5 py-1 rounded-md border border-coral/30">
                  02
                </span>
                <h3 className="text-lg font-extrabold text-ink">
                  Form Inputs Relying Solely on Placeholders
                </h3>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed font-medium">
                Placeholders vanish upon typing and are frequently skipped by screen readers. Every input requires an explicit programmatic label.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-coral-soft border border-coral/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-coral block font-sans">Problematic Pattern</span>
                  <code className="text-ink">&lt;input type=&quot;email&quot; placeholder=&quot;Enter your email&quot;&gt;</code>
                </div>
                <div className="p-3.5 rounded-xl bg-teal-soft border border-teal/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-teal block font-sans">Accessible Pattern</span>
                  <code className="text-ink">&lt;label for=&quot;user-email&quot;&gt;Email&lt;/label&gt;&lt;input id=&quot;user-email&quot; type=&quot;email&quot;&gt;</code>
                </div>
              </div>
            </article>

            {/* Fix 3 */}
            <article className="p-6 rounded-2xl bg-surface border-2 border-border-ink space-y-3 shadow-subtle">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-extrabold text-coral bg-coral-soft px-2.5 py-1 rounded-md border border-coral/30">
                  03
                </span>
                <h3 className="text-lg font-extrabold text-ink">
                  Icon-Only Buttons Without Accessible Names
                </h3>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed font-medium">
                Buttons containing only an SVG or icon font have no accessible name. Screen readers announce only &quot;button&quot; without explaining its purpose.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-coral-soft border border-coral/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-coral block font-sans">Problematic Pattern</span>
                  <code className="text-ink">&lt;button&gt;&lt;svg class=&quot;icon-trash&quot;&gt;&lt;/svg&gt;&lt;/button&gt;</code>
                </div>
                <div className="p-3.5 rounded-xl bg-teal-soft border border-teal/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-teal block font-sans">Accessible Pattern</span>
                  <code className="text-ink">&lt;button aria-label=&quot;Delete item&quot;&gt;&lt;svg aria-hidden=&quot;true&quot; ... /&gt;&lt;/button&gt;</code>
                </div>
              </div>
            </article>

            {/* Fix 4 */}
            <article className="p-6 rounded-2xl bg-surface border-2 border-border-ink space-y-3 shadow-subtle">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-extrabold text-ink bg-golden-soft px-2.5 py-1 rounded-md border border-golden/40">
                  04
                </span>
                <h3 className="text-lg font-extrabold text-ink">
                  Insufficient Text Color Contrast Ratio
                </h3>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed font-medium">
                Low contrast prevents people with low vision or situational glare from reading text. Maintain at least 4.5:1 contrast for normal body text and 3:1 for large text.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-coral-soft border border-coral/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-coral block font-sans">Low Contrast (2.1:1)</span>
                  <code className="text-ink">color: #94a3b8; background: #ffffff;</code>
                </div>
                <div className="p-3.5 rounded-xl bg-teal-soft border border-teal/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-teal block font-sans">AAA Compliant (7.2:1)</span>
                  <code className="text-ink">color: #18233A; background: #ffffff;</code>
                </div>
              </div>
            </article>

            {/* Fix 5 */}
            <article className="p-6 rounded-2xl bg-surface border-2 border-border-ink space-y-3 shadow-subtle">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-extrabold text-coral bg-coral-soft px-2.5 py-1 rounded-md border border-coral/30">
                  05
                </span>
                <h3 className="text-lg font-extrabold text-ink">
                  Removed Keyboard Focus Outlines
                </h3>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed font-medium">
                Applying <code className="font-mono text-coral font-bold">outline: none</code> without a replacement leaves keyboard users unable to locate focus. Always provide a visible focus indicator using <code className="font-mono text-teal font-bold">:focus-visible</code>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-coral-soft border border-coral/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-coral block font-sans">Focus Removed</span>
                  <code className="text-ink">*:focus &#123; outline: none; &#125;</code>
                </div>
                <div className="p-3.5 rounded-xl bg-teal-soft border border-teal/30 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-teal block font-sans">Focus Preserved</span>
                  <code className="text-ink">*:focus-visible &#123; outline: 3px solid #3157E8; outline-offset: 2px; &#125;</code>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* SECTION 4: AUTOMATED VS MANUAL */}
        <section id="scope" className="space-y-4 pt-6 border-t border-border-ink" aria-labelledby="heading-scope">
          <div className="space-y-1">
            <h2 id="heading-scope" className="text-2xl sm:text-3xl font-extrabold text-ink">
              What Can Automated Testing Detect?
            </h2>
            <p className="text-sm sm:text-base text-ink-muted font-medium">
              Understanding the boundaries between automated tools and manual human auditing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm leading-relaxed">
            <div className="p-6 rounded-2xl bg-surface border-2 border-border-ink space-y-3 shadow-subtle">
              <strong className="text-ink block font-extrabold text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal" />
                Automated Scans (axe-core)
              </strong>
              <ul className="space-y-2 text-ink-muted list-disc pl-5 font-medium text-xs sm:text-sm">
                <li>Detects deterministic syntax errors (missing alt attributes, unlabelled inputs, broken ARIA roles).</li>
                <li>Verifies HTML language tags, heading structure, and layout landmarks.</li>
                <li>Evaluates DOM nodes in under 2 seconds.</li>
                <li>Covers approximately <strong>30% to 50%</strong> of potential WCAG criteria.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-surface border-2 border-border-ink space-y-3 shadow-subtle">
              <strong className="text-ink block font-extrabold text-base flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-golden" />
                Manual Human Evaluation
              </strong>
              <ul className="space-y-2 text-ink-muted list-disc pl-5 font-medium text-xs sm:text-sm">
                <li>Verifies whether alternative text is truly meaningful and contextually descriptive.</li>
                <li>Tests keyboard-only task flows and verifies that focus order matches visual intent.</li>
                <li>Tests screen reader interaction (VoiceOver, NVDA, JAWS).</li>
                <li>Assesses cognitive clarity, reading comprehension, and error recovery guidance.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 5: STANDARDS & REFERENCES */}
        <section id="standards" className="space-y-5 pt-6 border-t border-border-ink" aria-labelledby="heading-standards">
          <h2 id="heading-standards" className="text-2xl sm:text-3xl font-extrabold text-ink">
            Standards & Authoritative References
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <a
              href="https://www.w3.org/WAI/fundamentals/accessibility-intro/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-surface hover:bg-cream border-2 border-border-ink hover:border-electric transition-all flex-1 shadow-subtle"
            >
              <span className="font-extrabold text-ink block flex items-center justify-between text-base">
                W3C Introduction to Accessibility
                <ExternalLink className="w-4 h-4 text-ink-muted" aria-hidden="true" />
              </span>
              <p className="text-ink-muted mt-2 leading-relaxed text-xs sm:text-sm font-medium">
                Official guide by the World Wide Web Consortium (W3C) on web accessibility principles and social impact.
              </p>
            </a>

            <a
              href="https://www.w3.org/TR/WCAG21/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-surface hover:bg-cream border-2 border-border-ink hover:border-electric transition-all flex-1 shadow-subtle"
            >
              <span className="font-extrabold text-ink block flex items-center justify-between text-base">
                WCAG 2.1 Technical Specifications
                <ExternalLink className="w-4 h-4 text-ink-muted" aria-hidden="true" />
              </span>
              <p className="text-ink-muted mt-2 leading-relaxed text-xs sm:text-sm font-medium">
                The normative technical specification defining Web Content Accessibility Guidelines Level A and AA.
              </p>
            </a>
          </div>

          <div className="pt-6 text-center">
            <Link
              href="/#scanner"
              className="inline-flex items-center text-base font-extrabold text-electric hover:underline"
            >
              Ready to evaluate your website? Run a scan &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
