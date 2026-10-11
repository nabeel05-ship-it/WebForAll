'use client';

import React, { useState } from 'react';
import { AccessibilityReport, ImpactLevel } from '@/lib/scanner/types';
import { generatePdfReport } from '@/lib/reports/pdf-generator';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Info,
  CheckCircle2,
  HelpCircle,
  Download,
  Printer,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Code2,
} from 'lucide-react';

interface ReportViewProps {
  report: AccessibilityReport;
  onReset?: () => void;
}

export default function ReportView({ report, onReset }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<'violations' | 'incomplete' | 'passes'>('violations');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({
    [report.violations[0]?.id || '']: true,
  });
  const [expandedTechDetails, setExpandedTechDetails] = useState<Record<string, boolean>>({});
  const [sortOrder, setSortOrder] = useState<'impact-desc' | 'impact-asc' | 'elements' | 'rule'>('impact-desc');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [copiedSelector, setCopiedSelector] = useState<string | null>(null);

  const toggleFinding = (id: string) => {
    setExpandedFindings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAllFindings = () => {
    const all: Record<string, boolean> = {};
    report.violations.forEach((v) => {
      all[v.id] = true;
    });
    setExpandedFindings(all);
  };

  const collapseAllFindings = () => {
    setExpandedFindings({});
  };

  const toggleTechDetails = (id: string) => {
    setExpandedTechDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSelector(id);
      setTimeout(() => setCopiedSelector(null), 2000);
    } catch {
      // Fallback
    }
  };

  const downloadJson = () => {
    let hostname = 'report';
    try {
      hostname = new URL(report.targetUrl).hostname.replace(/[^a-z0-9]/gi, '_');
    } catch {
      hostname = 'export';
    }
    const filename = `webforall-report-${hostname}.json`;
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfError(null);
      // Let UI update to show loading spinner
      await new Promise((resolve) => setTimeout(resolve, 80));
      generatePdfReport(report);
    } catch (err: unknown) {
      console.error('PDF generation failed:', err);
      setPdfError('Failed to generate PDF document. You can still use Print Report or Download JSON.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const printReport = () => {
    const allExpanded: Record<string, boolean> = {};
    const allTechExpanded: Record<string, boolean> = {};
    report.violations.forEach((v) => {
      allExpanded[v.id] = true;
      allTechExpanded[v.id] = true;
    });
    setExpandedFindings(allExpanded);
    setExpandedTechDetails(allTechExpanded);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Impact order ranking
  const impactRank: Record<string, number> = {
    critical: 4,
    serious: 3,
    moderate: 2,
    minor: 1,
  };

  // Filter and sort violations
  const filteredViolations = report.violations
    .filter((v) => {
      const matchesImpact = impactFilter === 'all' || v.impact === impactFilter;
      const matchesQuery =
        searchQuery === '' ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.nodes.some((n) => n.target.join(' ').toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesImpact && matchesQuery;
    })
    .sort((a, b) => {
      if (sortOrder === 'impact-desc') {
        const diff = (impactRank[b.impact] || 0) - (impactRank[a.impact] || 0);
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
      }
      if (sortOrder === 'impact-asc') {
        const diff = (impactRank[a.impact] || 0) - (impactRank[b.impact] || 0);
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
      }
      if (sortOrder === 'elements') {
        return b.nodes.length - a.nodes.length;
      }
      if (sortOrder === 'rule') {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });

  const getImpactBadge = (impact: ImpactLevel) => {
    switch (impact) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-coral-soft text-coral border border-coral/30">
            <AlertOctagon className="w-3.5 h-3.5 mr-1 text-coral" aria-hidden="true" />
            Critical Issue
          </span>
        );
      case 'serious':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-golden-soft text-ink border border-golden/40">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-golden" aria-hidden="true" />
            Serious Issue
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-golden-soft/60 text-ink border border-golden/30">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-golden" aria-hidden="true" />
            Moderate Issue
          </span>
        );
      case 'minor':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-electric-soft text-electric border border-electric/30">
            <Info className="w-3.5 h-3.5 mr-1 text-electric" aria-hidden="true" />
            Minor Issue
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 print-page">
      {/* ============================================================ */}
      {/* REPORT HEADER & CONTROL BAR */}
      {/* ============================================================ */}
      <section
        className="bg-surface rounded-2xl border border-border-ink p-6 sm:p-8 space-y-6 shadow-card relative overflow-hidden"
        aria-labelledby="report-heading"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-border-subtle">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-canvas text-ink border border-border-ink">
                {report.isDemo ? 'Controlled Demonstration' : 'Accessibility Evaluation Report'}
              </span>
              <span className="text-xs text-ink-muted flex items-center font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal mr-1.5" />
                {report.engine.name} v{report.engine.version}
              </span>
            </div>

            <h1
              id="report-heading"
              className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-mono break-all leading-snug"
            >
              {report.targetUrl}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted font-medium">
              <span>Audited on {new Date(report.timestamp).toLocaleString()}</span>
              <span>&bull;</span>
              <span className="font-mono text-ink font-bold">{report.scanDurationMs}ms scan time</span>
              <span>&bull;</span>
              <span className="text-electric font-semibold">WCAG 2.1 Level AA</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-end gap-2 no-print">
            <div className="flex flex-wrap items-center gap-2.5">
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center px-4 py-2.5 border border-border-ink rounded-lg text-sm font-bold text-ink bg-surface hover:bg-canvas transition-colors shadow-subtle focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-electric cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5 text-ink-muted" aria-hidden="true" />
                  Scan another site
                </button>
              )}
              <button
                type="button"
                onClick={downloadJson}
                className="inline-flex items-center px-4 py-2.5 border border-border-ink rounded-lg text-sm font-bold text-ink bg-surface hover:bg-canvas transition-colors shadow-subtle focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-electric cursor-pointer"
                title="Download raw structured JSON report"
              >
                <Download className="w-4 h-4 mr-1.5 text-ink-muted" aria-hidden="true" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={printReport}
                className="inline-flex items-center px-4 py-2.5 border border-border-ink rounded-lg text-sm font-bold text-ink bg-surface hover:bg-canvas transition-colors shadow-subtle focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-electric cursor-pointer"
                title="Open browser print dialog"
              >
                <Printer className="w-4 h-4 mr-1.5 text-ink-muted" aria-hidden="true" />
                Print Report
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-electric hover:bg-electric-hover active:bg-[#2244C9] disabled:bg-border-ink disabled:text-ink-muted transition-all shadow-electricGlow focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-electric cursor-pointer"
                title="Generate and download complete PDF report"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-1.5 text-white" aria-hidden="true" />
                    Download PDF
                  </>
                )}
              </button>
            </div>

            {pdfError && (
              <div
                role="alert"
                className="p-3 bg-coral-soft rounded-lg border border-coral/30 text-coral text-xs font-bold flex items-center justify-between gap-2 shadow-subtle"
              >
                <span>{pdfError}</span>
                <button
                  type="button"
                  onClick={() => setPdfError(null)}
                  className="underline hover:text-ink ml-1 font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>

        {/* EXPRESSIVE SIGNAL SUMMARY MODULES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 bg-canvas rounded-xl border border-border-ink text-center shadow-subtle">
            <span className="block text-3xl font-extrabold text-ink tabular-nums">
              {report.summary.totalViolations}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted mt-1 block">
              Total Violations
            </span>
          </div>

          <div className="p-4 bg-canvas rounded-xl border border-border-ink text-center shadow-subtle">
            <span className="block text-3xl font-extrabold text-ink tabular-nums">
              {report.summary.totalAffectedElements}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted mt-1 block">
              Affected Nodes
            </span>
          </div>

          <div className="p-4 bg-coral-soft rounded-xl border border-coral/30 text-center shadow-subtle">
            <span className="block text-3xl font-extrabold text-coral tabular-nums">
              {report.summary.byImpact.critical}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-coral mt-1 block">
              Critical
            </span>
          </div>

          <div className="p-4 bg-golden-soft rounded-xl border border-golden/40 text-center shadow-subtle">
            <span className="block text-3xl font-extrabold text-ink tabular-nums">
              {report.summary.byImpact.serious}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink mt-1 block">
              Serious
            </span>
          </div>

          <div className="p-4 bg-violet-soft rounded-xl border border-violet/30 text-center shadow-subtle">
            <span className="block text-3xl font-extrabold text-violet tabular-nums">
              {report.summary.incompleteCount}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-violet mt-1 block">
              Needs Review
            </span>
          </div>

          <div className="p-4 bg-teal-soft rounded-xl border border-teal/30 text-center shadow-subtle">
            <span className="block text-3xl font-extrabold text-teal tabular-nums">
              {report.summary.passedCount}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal mt-1 block">
              Passed Rules
            </span>
          </div>
        </div>

        {/* INTERACTIVE SEVERITY DISTRIBUTION RATIO BAR */}
        {report.summary.totalViolations > 0 && (
          <div className="space-y-2 p-4 bg-canvas rounded-xl border border-border-ink">
            <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
              <span className="uppercase tracking-wider text-ink font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                Severity Distribution Breakdown
              </span>
              <span className="text-[11px] font-sans">Click segment to filter</span>
            </div>

            <div className="h-4 w-full bg-border-ink/40 rounded-full overflow-hidden flex shadow-inner">
              {report.summary.byImpact.critical > 0 && (
                <button
                  type="button"
                  title={`Critical: ${report.summary.byImpact.critical} (${Math.round((report.summary.byImpact.critical / report.summary.totalViolations) * 100)}%)`}
                  onClick={() => { setActiveTab('violations'); setImpactFilter('critical'); }}
                  style={{ width: `${(report.summary.byImpact.critical / report.summary.totalViolations) * 100}%` }}
                  className="h-full bg-coral hover:opacity-80 transition-opacity cursor-pointer"
                />
              )}
              {report.summary.byImpact.serious > 0 && (
                <button
                  type="button"
                  title={`Serious: ${report.summary.byImpact.serious} (${Math.round((report.summary.byImpact.serious / report.summary.totalViolations) * 100)}%)`}
                  onClick={() => { setActiveTab('violations'); setImpactFilter('serious'); }}
                  style={{ width: `${(report.summary.byImpact.serious / report.summary.totalViolations) * 100}%` }}
                  className="h-full bg-golden hover:opacity-80 transition-opacity cursor-pointer"
                />
              )}
              {report.summary.byImpact.moderate > 0 && (
                <button
                  type="button"
                  title={`Moderate: ${report.summary.byImpact.moderate} (${Math.round((report.summary.byImpact.moderate / report.summary.totalViolations) * 100)}%)`}
                  onClick={() => { setActiveTab('violations'); setImpactFilter('moderate'); }}
                  style={{ width: `${(report.summary.byImpact.moderate / report.summary.totalViolations) * 100}%` }}
                  className="h-full bg-[#E5832E] hover:opacity-80 transition-opacity cursor-pointer"
                />
              )}
              {report.summary.byImpact.minor > 0 && (
                <button
                  type="button"
                  title={`Minor: ${report.summary.byImpact.minor} (${Math.round((report.summary.byImpact.minor / report.summary.totalViolations) * 100)}%)`}
                  onClick={() => { setActiveTab('violations'); setImpactFilter('minor'); }}
                  style={{ width: `${(report.summary.byImpact.minor / report.summary.totalViolations) * 100}%` }}
                  className="h-full bg-electric hover:opacity-80 transition-opacity cursor-pointer"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-ink-muted pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-coral inline-block" /> Critical: {report.summary.byImpact.critical} ({Math.round((report.summary.byImpact.critical / report.summary.totalViolations) * 100)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-golden inline-block" /> Serious: {report.summary.byImpact.serious} ({Math.round((report.summary.byImpact.serious / report.summary.totalViolations) * 100)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5832E] inline-block" /> Moderate: {report.summary.byImpact.moderate} ({Math.round((report.summary.byImpact.moderate / report.summary.totalViolations) * 100)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-electric inline-block" /> Minor: {report.summary.byImpact.minor} ({Math.round((report.summary.byImpact.minor / report.summary.totalViolations) * 100)}%)
              </span>
            </div>
          </div>
        )}

        {/* "WHAT NEXT?" PRIORITIZATION GUIDANCE */}
        <div className="p-4 rounded-xl bg-cream border border-golden/30 text-ink text-sm leading-relaxed flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-golden flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <strong className="font-bold text-ink block">Prioritizing your remediation next steps</strong>
            <p className="text-ink-muted text-xs sm:text-sm">
              Focus first on the <strong>Critical</strong> and <strong>Serious</strong> violations below—these are direct blockers for screen reader and keyboard users. Once fixed, conduct interactive keyboard task flows (Tab, Enter, Escape) to verify review criteria.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TABS NAVIGATION */}
      {/* ============================================================ */}
      <div className="flex border-b border-border-ink no-print gap-2" role="tablist" aria-label="Report findings tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'violations'}
          onClick={() => setActiveTab('violations')}
          className={`px-5 py-3 text-base font-bold border-b-2 transition-all rounded-t-lg ${
            activeTab === 'violations'
              ? 'border-electric text-electric bg-surface shadow-subtle'
              : 'border-transparent text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          Violations ({report.violations.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'incomplete'}
          onClick={() => setActiveTab('incomplete')}
          className={`px-5 py-3 text-base font-bold border-b-2 transition-all rounded-t-lg ${
            activeTab === 'incomplete'
              ? 'border-violet text-violet bg-surface shadow-subtle'
              : 'border-transparent text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          Needs Human Review ({report.incomplete.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'passes'}
          onClick={() => setActiveTab('passes')}
          className={`px-5 py-3 text-base font-bold border-b-2 transition-all rounded-t-lg ${
            activeTab === 'passes'
              ? 'border-teal text-teal bg-surface shadow-subtle'
              : 'border-transparent text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          Passed Checks ({report.passes.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: VIOLATIONS LIST */}
      {/* ============================================================ */}
      {activeTab === 'violations' && (
        <section aria-label="Detected Violations" className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-surface p-4 rounded-xl border border-border-ink shadow-subtle space-y-3 no-print">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center mr-1">
                  <Filter className="w-3.5 h-3.5 mr-1 text-ink-muted" aria-hidden="true" />
                  Filter Severity:
                </span>
                {(['all', 'critical', 'serious', 'moderate', 'minor'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setImpactFilter(lvl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      impactFilter === lvl
                        ? 'bg-electric text-white shadow-subtle'
                        : 'bg-canvas text-ink-muted hover:text-ink hover:bg-surface border border-border-ink'
                    }`}
                  >
                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    {lvl !== 'all' && ` (${report.summary.byImpact[lvl]})`}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <label htmlFor="search-findings" className="sr-only">
                  Search findings by rule or selector
                </label>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <Search className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="search-findings"
                  type="text"
                  placeholder="Search rule, title, selector..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm border border-border-ink rounded-lg bg-canvas text-ink focus:bg-surface focus:border-electric focus:ring-2 focus:ring-electric/20 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Sort Controls & Expand/Collapse All Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink-muted">Sort by:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'impact-desc' | 'impact-asc' | 'elements' | 'rule')}
                  className="px-2.5 py-1.5 rounded-lg border border-border-ink bg-canvas text-ink font-bold text-xs focus:ring-2 focus:ring-electric cursor-pointer"
                  aria-label="Sort findings"
                >
                  <option value="impact-desc">Severity: Highest first</option>
                  <option value="impact-asc">Severity: Lowest first</option>
                  <option value="elements">Affected Elements Count</option>
                  <option value="rule">Rule ID (A to Z)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandAllFindings}
                  className="px-3 py-1 rounded-md text-xs font-bold text-ink bg-canvas hover:bg-cream border border-border-ink transition-colors cursor-pointer"
                >
                  Expand all details
                </button>
                <button
                  type="button"
                  onClick={collapseAllFindings}
                  className="px-3 py-1 rounded-md text-xs font-bold text-ink bg-canvas hover:bg-cream border border-border-ink transition-colors cursor-pointer"
                >
                  Collapse all
                </button>
              </div>
            </div>

            {/* Active filter count indicator */}
            {(impactFilter !== 'all' || searchQuery !== '') && (
              <div className="flex items-center justify-between text-xs font-bold text-ink-muted pt-2 border-t border-border-subtle">
                <span>
                  Showing {filteredViolations.length} of {report.violations.length} violations
                  {impactFilter !== 'all' && ` matching "${impactFilter}"`}
                  {searchQuery && ` for query "${searchQuery}"`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setImpactFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-electric hover:underline font-bold"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Violations Feed */}
          {filteredViolations.length === 0 ? (
            <div className="p-10 text-center bg-surface rounded-2xl border border-border-ink shadow-subtle space-y-3">
              <CheckCircle2 className="w-12 h-12 text-teal mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-extrabold text-ink">
                {report.violations.length === 0
                  ? 'No automated violations detected!'
                  : 'No violations match your current filter.'}
              </h2>
              <p className="text-sm text-ink-muted max-w-lg mx-auto leading-relaxed">
                {report.violations.length === 0
                  ? 'axe-core detected no automated failures for this page DOM. Remember to conduct manual testing and keyboard checks for complete evaluation.'
                  : 'Try selecting "All" severity levels or clearing your search query.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredViolations.map((v) => {
                const isExpanded = !!expandedFindings[v.id];
                return (
                  <article
                    key={v.id}
                    className="bg-surface rounded-xl border border-border-ink shadow-subtle overflow-hidden transition-all hover:border-border-strong"
                  >
                    {/* Collapsible Trigger Header */}
                    <button
                      type="button"
                      onClick={() => toggleFinding(v.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`finding-details-${v.id}`}
                      className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-canvas/50 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-electric print-heading-block"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {getImpactBadge(v.impact)}
                          <span className="text-xs font-mono font-bold text-ink bg-canvas px-2.5 py-1 rounded-md border border-border-ink">
                            {v.id}
                          </span>
                          <span className="text-xs text-ink-muted font-semibold">
                            {v.nodes.length} element{v.nodes.length !== 1 ? 's' : ''} affected
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-ink">
                          {v.title}
                        </h2>
                        <p className="text-sm text-ink-muted line-clamp-2 leading-relaxed">
                          {v.description}
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-ink self-center p-2 rounded-lg bg-canvas border border-border-ink no-print">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-ink" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-ink" aria-hidden="true" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Detail Panel */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key={`finding-content-${v.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div
                            id={`finding-details-${v.id}`}
                            className="px-5 pb-6 sm:px-6 pt-4 border-t border-border-ink space-y-5 bg-surface-subtle"
                          >
                        {/* ============================================================ */}
                        {/* PLAIN-LANGUAGE EXPLANATIONS (VISIBLE FIRST) */}
                        {/* ============================================================ */}

                        {/* 1. What is the problem? & 2. Why does it matter? */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-surface rounded-xl border border-border-ink space-y-1.5 shadow-subtle">
                            <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-electric" aria-hidden="true" />
                              What is the Problem?
                            </h3>
                            <p className="text-sm text-ink leading-relaxed">
                              {v.remediation.whatIsWrong || v.description}
                            </p>
                          </div>

                          <div className="p-4 bg-surface rounded-xl border border-border-ink space-y-1.5 shadow-subtle">
                            <h3 className="text-xs font-bold text-electric uppercase tracking-wider flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-electric" aria-hidden="true" />
                              Why Does It Matter?
                            </h3>
                            <p className="text-sm text-ink leading-relaxed">
                              {v.remediation.whyItMatters}
                            </p>
                          </div>
                        </div>

                        {/* 3. Who may be affected? */}
                        <div className="p-4 bg-surface rounded-xl border border-border-ink space-y-1.5 shadow-subtle">
                          <h3 className="text-xs font-bold text-violet uppercase tracking-wider flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-violet" aria-hidden="true" />
                            Who May Be Affected?
                          </h3>
                          <p className="text-sm text-ink-muted leading-relaxed">
                            {v.remediation.whoIsAffected}
                          </p>
                        </div>

                        {/* 4. How to fix it */}
                        <div className="p-4 bg-surface rounded-xl border border-border-ink space-y-1.5 shadow-subtle">
                          <h3 className="text-xs font-bold text-teal uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal" aria-hidden="true" />
                            How to Fix It
                          </h3>
                          <p className="text-sm text-ink leading-relaxed">
                            {v.remediation.howToFix}
                          </p>
                        </div>

                        {/* ============================================================ */}
                        {/* EXPANDABLE TECHNICAL DETAILS & CODE SELECTORS (FOR DEVELOPERS) */}
                        {/* ============================================================ */}
                        <div className="border border-border-ink rounded-xl bg-surface overflow-hidden shadow-subtle">
                          <button
                            type="button"
                            onClick={() => toggleTechDetails(v.id)}
                            aria-expanded={!!expandedTechDetails[v.id]}
                            aria-controls={`tech-details-${v.id}`}
                            className="w-full text-left p-4 bg-canvas/60 hover:bg-canvas transition-colors flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric cursor-pointer no-print"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Code2 className="w-4 h-4 text-electric" aria-hidden="true" />
                              <span className="font-bold text-xs uppercase tracking-wider text-ink">
                                Technical Details & Code Selectors (for developers)
                              </span>
                              <span className="text-xs font-mono font-bold text-ink-muted bg-surface px-2 py-0.5 rounded border border-border-subtle">
                                {v.nodes.length} element{v.nodes.length !== 1 ? 's' : ''} &bull; {v.id}
                              </span>
                            </div>

                            <div className="text-ink-muted">
                              {expandedTechDetails[v.id] ? (
                                <ChevronUp className="w-4 h-4" aria-hidden="true" />
                              ) : (
                                <ChevronDown className="w-4 h-4" aria-hidden="true" />
                              )}
                            </div>
                          </button>

                          <AnimatePresence initial={false}>
                            {expandedTechDetails[v.id] && (
                              <motion.div
                                key={`tech-content-${v.id}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <div id={`tech-details-${v.id}`} className="p-5 border-t border-border-subtle space-y-5 bg-surface">
                                  {/* Standards & Official Documentation */}
                                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-subtle text-xs">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-bold text-ink">Rule Standards:</span>
                                      {(v.remediation.wcagCriteria || v.tags).map((tag, tIdx) => (
                                        <span
                                          key={tIdx}
                                          className="px-2.5 py-1 rounded-md bg-canvas text-ink font-bold border border-border-ink font-mono text-[11px]"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>

                                    {v.remediation.referenceUrl && (
                                      <a
                                        href={v.remediation.referenceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-electric hover:text-electric-hover font-bold transition-colors text-xs"
                                      >
                                        Official Rule Documentation
                                        <ExternalLink className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                                      </a>
                                    )}
                                  </div>

                                  {/* Affected DOM Elements List */}
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                                      Affected Elements on Page ({v.nodes.length})
                                    </h4>
                                    <div className="space-y-3">
                                      {v.nodes.map((node, idx) => {
                                        const selectorStr = node.target.join(' ');
                                        const copyId = `${v.id}-node-${idx}`;
                                        return (
                                          <div
                                            key={idx}
                                            className="p-4 bg-canvas rounded-xl border border-border-ink space-y-2 font-mono text-xs shadow-subtle"
                                          >
                                            <div className="flex items-center justify-between text-ink-muted pb-2 border-b border-border-subtle font-sans">
                                              <span className="font-bold text-ink text-xs">
                                                Element #{idx + 1} CSS Selector:
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => copyToClipboard(selectorStr, copyId)}
                                                className="inline-flex items-center text-xs font-bold text-electric hover:text-electric-hover transition-colors rounded-md px-2.5 py-1 bg-electric-soft border border-electric/20 font-sans no-print cursor-pointer"
                                                title="Copy CSS Selector"
                                              >
                                                {copiedSelector === copyId ? (
                                                  <>
                                                    <Check className="w-3.5 h-3.5 mr-1 text-teal" aria-hidden="true" />
                                                    <span className="text-teal font-bold">Copied!</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy className="w-3.5 h-3.5 mr-1 text-electric" aria-hidden="true" />
                                                    Copy Selector
                                                  </>
                                                )}
                                              </button>
                                            </div>

                                            <div className="text-electric break-all select-all font-semibold pt-0.5 text-sm">
                                              {selectorStr}
                                            </div>

                                            {node.html && (
                                              <div className="mt-2.5 pt-2.5 border-t border-border-subtle">
                                                <span className="text-ink-muted block mb-1 text-[11px] font-sans font-semibold">
                                              Target HTML Snippet:
                                            </span>
                                            <pre className="overflow-x-auto text-ink text-xs whitespace-pre-wrap break-all bg-surface p-3 rounded-lg border border-border-ink font-mono">
                                              <code>{node.html}</code>
                                            </pre>
                                          </div>
                                        )}

                                        {node.failureSummary && (
                                          <div className="text-ink-muted text-xs font-sans pt-1">
                                            <span className="text-coral font-bold">axe-core note: </span>
                                            {node.failureSummary}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Code Example (if available) */}
                              {v.remediation.codeExample && (
                                <div className="space-y-2.5 pt-2 border-t border-border-subtle">
                                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                                    Illustrative Code Example
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    <div className="p-4 bg-coral-soft rounded-xl border border-coral/30 space-y-2 shadow-subtle">
                                      <span className="text-xs font-extrabold text-coral block uppercase tracking-wider">
                                        Problematic Pattern (Do Not Use)
                                      </span>
                                      <pre className="text-xs text-ink font-mono bg-surface p-3 rounded-lg border border-coral/25 overflow-x-auto">
                                        <code>{v.remediation.codeExample.incorrect}</code>
                                      </pre>
                                    </div>

                                    <div className="p-4 bg-teal-soft rounded-xl border border-teal/30 space-y-2 shadow-subtle">
                                      <span className="text-xs font-extrabold text-teal block uppercase tracking-wider">
                                        Recommended Pattern
                                      </span>
                                      <pre className="text-xs text-ink font-mono bg-surface p-3 rounded-lg border border-teal/25 overflow-x-auto">
                                        <code>{v.remediation.codeExample.correct}</code>
                                      </pre>
                                    </div>
                                  </div>
                                  <p className="text-xs text-ink-muted italic">
                                    * {v.remediation.codeExample.explanation} Note: The exact fix depends on your surrounding HTML and application behavior.
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 2: INCOMPLETE CHECKS (HUMAN REVIEW) */}
      {/* ============================================================ */}
      {activeTab === 'incomplete' && (
        <section aria-label="Checks requiring manual review" className="space-y-4">
          <div className="p-5 bg-violet-soft rounded-xl border border-violet/30 text-ink text-sm sm:text-base leading-relaxed flex items-start gap-3 shadow-subtle">
            <HelpCircle className="w-5 h-5 text-violet flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <span className="font-bold text-violet block">Why do these checks require human review?</span>
              <p className="text-sm text-ink-muted">
                Automated algorithms cannot definitively verify visual contrast without rendering context, nor can they determine if a button description is contextually meaningful or if an image is genuinely decorative.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {report.incomplete.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-surface rounded-xl border border-border-ink shadow-subtle space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-violet-soft text-violet border border-violet/30">
                      {item.id}
                    </span>
                    <span className="text-xs text-ink-muted font-semibold">
                      {item.nodesCount} element{item.nodesCount !== 1 ? 's' : ''} evaluated
                    </span>
                  </div>
                  {item.helpUrl && (
                    <a
                      href={item.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-electric hover:underline inline-flex items-center font-bold"
                    >
                      Rule Info
                      <ExternalLink className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                    </a>
                  )}
                </div>
                <h2 className="text-base font-bold text-ink">{item.help}</h2>
                <p className="text-sm text-ink-muted leading-relaxed">{item.description}</p>
                <p className="text-xs text-ink bg-surface-subtle p-3 rounded-lg border border-border-subtle font-medium">
                  <span className="font-bold text-violet">Review Requirement: </span>
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PASSED CHECKS */}
      {/* ============================================================ */}
      {activeTab === 'passes' && (
        <section aria-label="Passed rules" className="space-y-4">
          <div className="p-5 bg-teal-soft rounded-xl border border-teal/30 text-ink text-sm sm:text-base leading-relaxed flex items-start gap-3 shadow-subtle">
            <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <span className="font-bold text-teal block">Automated Evaluated Passes</span>
              <p className="text-sm text-ink-muted">
                These {report.passes.length} rules were tested against the page DOM and no violations were found. Remember that automated passes confirm specific syntax rules, but do not replace manual usability testing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {report.passes.map((pass) => (
              <div
                key={pass.id}
                className="p-4 bg-surface rounded-xl border border-border-ink shadow-subtle space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" aria-hidden="true" />
                  <span className="font-mono text-xs font-bold text-ink bg-canvas px-2 py-0.5 rounded border border-border-ink">
                    {pass.id}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-ink">{pass.help}</h2>
                <p className="text-xs text-ink-muted leading-relaxed">{pass.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
