'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Palette,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Sliders,
  Check,
  MousePointer,
  Keyboard,
} from 'lucide-react';

export default function InteractiveA11yLab() {
  const [activeTab, setActiveTab] = useState<'name' | 'contrast'>('name');

  // Accessible Name Lab State
  const [buttonType, setButtonType] = useState<'icon-only' | 'aria-label' | 'visible-text' | 'sr-only'>('aria-label');
  const [customLabel, setCustomLabel] = useState('Submit registration form');

  // Contrast Lab State
  const [textColor, setTextColor] = useState('#18233A');
  const [bgColor, setBgColor] = useState('#F2F0FF');

  // Calculate approximate contrast ratio
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return 0.5;
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    const sRGB = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(textColor);
  const lum2 = getLuminance(bgColor);
  const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  const formattedRatio = ratio.toFixed(2);
  const passesAA = ratio >= 4.5;
  const passesAALarge = ratio >= 3.0;
  const passesAAA = ratio >= 7.0;

  return (
    <div className="bg-surface rounded-2xl border-2 border-border-ink p-6 sm:p-8 space-y-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-golden" />
          <h3 className="text-xl font-extrabold text-ink">
            Interactive Accessibility Lab
          </h3>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-canvas p-1 rounded-xl border border-border-ink text-xs font-bold" role="tablist" aria-label="Interactive Lab Modules">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'name'}
            onClick={() => setActiveTab('name')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'name' ? 'bg-electric text-white shadow-subtle' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Accessible Name Simulator
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'contrast'}
            onClick={() => setActiveTab('contrast')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'contrast' ? 'bg-electric text-white shadow-subtle' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Color Contrast Checker
          </button>
        </div>
      </div>

      {/* LAB 1: ACCESSIBLE NAME & SPEECH SIMULATOR */}
      {activeTab === 'name' && (
        <div className="space-y-6">
          <p className="text-sm text-ink-muted leading-relaxed font-medium">
            Test how screen readers (VoiceOver, NVDA, JAWS) announce interactive buttons based on their HTML markup.
          </p>

          {/* Mode Selector */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setButtonType('icon-only')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                buttonType === 'icon-only'
                  ? 'border-coral bg-coral-soft text-coral shadow-subtle'
                  : 'border-border-ink bg-canvas text-ink-muted hover:text-ink'
              }`}
            >
              1. Icon-Only (Unlabelled Barrier)
            </button>
            <button
              type="button"
              onClick={() => setButtonType('aria-label')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                buttonType === 'aria-label'
                  ? 'border-teal bg-teal-soft text-teal shadow-subtle'
                  : 'border-border-ink bg-canvas text-ink-muted hover:text-ink'
              }`}
            >
              2. With aria-label (Accessible)
            </button>
            <button
              type="button"
              onClick={() => setButtonType('sr-only')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                buttonType === 'sr-only'
                  ? 'border-violet bg-violet-soft text-violet shadow-subtle'
                  : 'border-border-ink bg-canvas text-ink-muted hover:text-ink'
              }`}
            >
              3. Visually Hidden (.sr-only)
            </button>
            <button
              type="button"
              onClick={() => setButtonType('visible-text')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                buttonType === 'visible-text'
                  ? 'border-electric bg-electric-soft text-electric shadow-subtle'
                  : 'border-border-ink bg-canvas text-ink-muted hover:text-ink'
              }`}
            >
              4. Visible Text (Best Practice)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Rendered Button in Viewport */}
            <div className="p-5 rounded-xl bg-canvas border border-border-ink space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-ink-muted block">
                Rendered Web Button:
              </span>

              <div className="h-24 flex items-center justify-center bg-surface rounded-lg border border-border-ink">
                {buttonType === 'icon-only' && (
                  <button
                    type="button"
                    className="p-3 bg-coral text-white rounded-xl shadow-subtle cursor-pointer focus:outline-none focus:ring-4 focus:ring-coral/20"
                  >
                    <MousePointer className="w-5 h-5" />
                  </button>
                )}
                {buttonType === 'aria-label' && (
                  <button
                    type="button"
                    aria-label={customLabel}
                    className="p-3 bg-teal text-white rounded-xl shadow-subtle cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal/20 flex items-center gap-2"
                  >
                    <MousePointer className="w-5 h-5" />
                  </button>
                )}
                {buttonType === 'sr-only' && (
                  <button
                    type="button"
                    className="p-3 bg-violet text-white rounded-xl shadow-subtle cursor-pointer focus:outline-none focus:ring-4 focus:ring-violet/20 flex items-center gap-2"
                  >
                    <MousePointer className="w-5 h-5" />
                    <span className="sr-only">{customLabel}</span>
                  </button>
                )}
                {buttonType === 'visible-text' && (
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-electric text-white font-bold text-sm rounded-xl shadow-subtle cursor-pointer focus:outline-none focus:ring-4 focus:ring-electric/20 flex items-center gap-2"
                  >
                    <MousePointer className="w-4 h-4" />
                    <span>{customLabel}</span>
                  </button>
                )}
              </div>

              {buttonType !== 'icon-only' && (
                <div className="space-y-1">
                  <label htmlFor="custom-label-input" className="text-[11px] font-bold text-ink-muted block">
                    Edit Accessible Name Text:
                  </label>
                  <input
                    id="custom-label-input"
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-border-ink bg-surface text-ink"
                  />
                </div>
              )}

              {/* Code Preview */}
              <div className="pt-2 border-t border-border-subtle">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                  Generated HTML:
                </span>
                <pre className="text-[11px] font-mono bg-surface p-2.5 rounded-lg border border-border-ink text-ink overflow-x-auto">
                  <code>
                    {buttonType === 'icon-only' && '<button class="btn">\n  <svg ...></svg>\n</button>'}
                    {buttonType === 'aria-label' && `<button aria-label="${customLabel}">\n  <svg aria-hidden="true" ...></svg>\n</button>`}
                    {buttonType === 'sr-only' && `<button class="btn">\n  <svg aria-hidden="true" ...></svg>\n  <span class="sr-only">${customLabel}</span>\n</button>`}
                    {buttonType === 'visible-text' && `<button class="btn">\n  <svg aria-hidden="true" ...></svg>\n  <span>${customLabel}</span>\n</button>`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Screen Reader Voiceover Box */}
            <div className="p-5 rounded-xl bg-ink text-white space-y-3 shadow-card flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white/70">
                  <span className="flex items-center gap-1.5">
                    {buttonType === 'icon-only' ? (
                      <VolumeX className="w-4 h-4 text-coral" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-teal animate-pulse" />
                    )}
                    <span>Simulated Screen Reader Speech Synthesizer</span>
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/10">VoiceOver</span>
                </div>

                <div className="p-4 rounded-lg bg-white/10 border border-white/15 min-h-[72px] flex items-center">
                  <p className="font-mono text-sm leading-relaxed">
                    {buttonType === 'icon-only' && (
                      <span className="text-coral font-bold">&quot;button&quot; (No accessible name computed)</span>
                    )}
                    {buttonType === 'aria-label' && (
                      <span className="text-teal font-bold">&quot;{customLabel}, button&quot;</span>
                    )}
                    {buttonType === 'sr-only' && (
                      <span className="text-violet-soft font-bold">&quot;{customLabel}, button&quot;</span>
                    )}
                    {buttonType === 'visible-text' && (
                      <span className="text-teal-soft font-bold">&quot;{customLabel}, button&quot;</span>
                    )}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-white/70 leading-relaxed font-sans pt-2 border-t border-white/10">
                {buttonType === 'icon-only'
                  ? 'Screen reader users hear only a generic button sound without any explanation of what action it performs.'
                  : 'Clear, predictable accessible name announced. Speech-recognition users can also target this element by voice.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LAB 2: COLOR CONTRAST RATIO LAB */}
      {activeTab === 'contrast' && (
        <div className="space-y-6">
          <p className="text-sm text-ink-muted leading-relaxed font-medium">
            Evaluate text-to-background contrast ratios against the WCAG AA minimum requirement of 4.5:1.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Color controls */}
            <div className="space-y-4 p-5 rounded-xl bg-canvas border border-border-ink">
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink flex items-center justify-between">
                  <span>Foreground Text Color:</span>
                  <code className="font-mono text-ink-muted">{textColor}</code>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border-ink cursor-pointer p-0.5 bg-surface"
                  />
                  <div className="flex gap-1.5">
                    {['#18233A', '#3157E8', '#58677D', '#94A3B8'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTextColor(c)}
                        style={{ backgroundColor: c }}
                        className="w-6 h-6 rounded-md border border-border-ink cursor-pointer"
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-ink flex items-center justify-between">
                  <span>Background Surface Color:</span>
                  <code className="font-mono text-ink-muted">{bgColor}</code>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border-ink cursor-pointer p-0.5 bg-surface"
                  />
                  <div className="flex gap-1.5">
                    {['#FFFFFF', '#F2F0FF', '#FFF8EA', '#E3EAFF'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBgColor(c)}
                        style={{ backgroundColor: c }}
                        className="w-6 h-6 rounded-md border border-border-ink cursor-pointer"
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contrast Scorecard & Preview */}
            <div className="p-5 rounded-xl border border-border-ink space-y-4 shadow-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="text-xs font-bold text-ink-muted uppercase">Computed Ratio:</span>
                <span className="text-3xl font-extrabold text-ink font-mono tabular-nums">
                  {formattedRatio} : 1
                </span>
              </div>

              {/* Sample rendered typography */}
              <div
                style={{ backgroundColor: bgColor, color: textColor }}
                className="p-4 rounded-xl border border-border-ink transition-colors text-center space-y-1"
              >
                <p className="text-base font-bold">Sample Display Heading</p>
                <p className="text-xs font-medium">Regular body text rendered on this surface</p>
              </div>

              {/* Verdict Badges */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div
                    className={`p-2 rounded-lg border ${
                      passesAA
                        ? 'bg-teal-soft text-teal border-teal/30'
                        : 'bg-coral-soft text-coral border-coral/30'
                    }`}
                  >
                    <span className="block text-[10px] uppercase font-mono">Normal Text</span>
                    <span>{passesAA ? 'Pass (AA)' : 'Fail'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      passesAALarge
                        ? 'bg-teal-soft text-teal border-teal/30'
                        : 'bg-coral-soft text-coral border-coral/30'
                    }`}
                  >
                    <span className="block text-[10px] uppercase font-mono">Large (18pt+)</span>
                    <span>{passesAALarge ? 'Pass (AA)' : 'Fail'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      passesAAA
                        ? 'bg-teal-soft text-teal border-teal/30'
                        : 'bg-canvas text-ink-muted border-border-ink'
                    }`}
                  >
                    <span className="block text-[10px] uppercase font-mono">Enhanced (7:1)</span>
                    <span>{passesAAA ? 'Pass (AAA)' : 'Fail'}</span>
                  </div>
                </div>

                {!passesAA && (
                  <div className="p-2.5 rounded-lg bg-coral-soft/60 border border-coral/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-coral font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      Fails WCAG AA minimum (4.5:1)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const targetColor = lum2 > 0.35 ? '#18233A' : '#FFFFFF';
                        setTextColor(targetColor);
                      }}
                      className="px-2.5 py-1 bg-surface hover:bg-teal-soft text-teal font-bold rounded border border-teal/30 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      Auto-fix to {lum2 > 0.35 ? '#18233A' : '#FFFFFF'} (guarantees ≥ 7:1) &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
