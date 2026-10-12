import { JSDOM, VirtualConsole } from 'jsdom';
import axe, { AxeResults } from 'axe-core';
import { AccessibilityReport, Finding, ImpactLevel, IncompleteCheck, PassedCheck, ScanSummary } from './types';
import { getRemediationForRule } from './remediation-catalog';

export interface RunScanOptions {
  html: string;
  targetUrl: string;
  finalUrl?: string;
  isDemo?: boolean;
  fetchTimeMs?: number;
}

const DISCLAIMER_TEXT =
  'Automated scanning detects a subset of potential accessibility barriers (typically 30% to 50% of WCAG criteria). The absence of detected violations does not guarantee WCAG compliance. Complete accessibility evaluation requires human review, keyboard navigation testing, and screen reader verification by people with disabilities.';

/**
 * Executes axe-core analysis on the provided HTML document within a headless JSDOM environment.
 */
export async function runAxeScan(options: RunScanOptions): Promise<AccessibilityReport> {
  const startTime = Date.now();
  const { html, targetUrl, finalUrl = targetUrl, isDemo = false } = options;

  // Suppress canvas/CSS layout warnings in JSDOM console
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('error', () => {
    // Suppress expected JSDOM warnings like unimplemented canvas
  });
  virtualConsole.on('warn', () => {
    // Suppress JSDOM CSS warnings
  });

  const dom = new JSDOM(html, {
    url: finalUrl,
    virtualConsole,
    runScripts: 'outside-only',
  });

  const win = dom.window;

  // Provide essential DOM API shims required by axe-core in headless virtual DOM
  if (typeof win.document.elementsFromPoint !== 'function') {
    win.document.elementsFromPoint = () => [];
  }
  if (typeof win.document.elementFromPoint !== 'function') {
    win.document.elementFromPoint = () => null;
  }
  if (win.HTMLCanvasElement && win.HTMLCanvasElement.prototype) {
    (win.HTMLCanvasElement.prototype as any).getContext = function (contextId: string) {
      if (contextId === '2d') {
        return {
          canvas: this,
          measureText: (text: string) => ({ width: (text || '').length * 8 }),
          fillText: () => {},
          strokeText: () => {},
          clearRect: () => {},
          fillRect: () => {},
          strokeRect: () => {},
          getImageData: () => ({ data: new Uint8ClampedArray(4) }),
          putImageData: () => {},
          createImageData: () => ({ data: new Uint8ClampedArray(4) }),
          setTransform: () => {},
          resetTransform: () => {},
          save: () => {},
          restore: () => {},
          scale: () => {},
          rotate: () => {},
          translate: () => {},
          transform: () => {},
          beginPath: () => {},
          closePath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          rect: () => {},
          arc: () => {},
          fill: () => {},
          stroke: () => {},
        } as unknown as RenderingContext;
      }
      return null;
    };
  }

  const documentElement = dom.window.document.documentElement;

  // Execute axe-core with WCAG 2.0 / 2.1 Level A and AA tags plus best practices
  const axeResults: AxeResults = await axe.run(documentElement, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    },
    reporter: 'v2',
  });

  // Process Violations
  const violations: Finding[] = (axeResults.violations || []).map((v) => {
    const impact: ImpactLevel = (v.impact as ImpactLevel) || 'moderate';
    const remediation = getRemediationForRule(v.id, v.description, v.helpUrl);

    return {
      id: v.id,
      impact,
      title: remediation.friendlyTitle || v.help || v.id,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags || [],
      nodes: (v.nodes || []).map((n) => ({
        target: (n.target || []).map((t) => (typeof t === 'string' ? t : JSON.stringify(t))),
        html: (n.html || '').trim().slice(0, 400), // Truncate oversized HTML snippets safely
        failureSummary: n.failureSummary,
      })),
      remediation,
    };
  });

  // Sort violations by impact priority: critical -> serious -> moderate -> minor
  const impactWeight: Record<ImpactLevel, number> = {
    critical: 4,
    serious: 3,
    moderate: 2,
    minor: 1,
  };
  violations.sort((a, b) => impactWeight[b.impact] - impactWeight[a.impact]);

  // Process Incomplete checks
  const incomplete: IncompleteCheck[] = (axeResults.incomplete || []).map((inc) => {
    let reason = 'Requires manual verification or visual context not fully computable automatically.';
    if (inc.nodes && inc.nodes.length > 0) {
      const allChecks = [
        ...(inc.nodes[0].any || []),
        ...(inc.nodes[0].all || []),
        ...(inc.nodes[0].none || []),
      ];
      const checkWithMessage = allChecks.find(
        (c) => c.message && c.message.trim().length > 0 && c.id !== 'error-occurred'
      );
      if (checkWithMessage && checkWithMessage.message) {
        reason = checkWithMessage.message;
      } else if (inc.nodes[0].failureSummary) {
        reason = inc.nodes[0].failureSummary;
      }
    }

    return {
      id: inc.id,
      description: inc.description,
      help: inc.help,
      helpUrl: inc.helpUrl,
      nodesCount: inc.nodes ? inc.nodes.length : 0,
      reason,
    };
  });

  // Process Passed checks
  const passes: PassedCheck[] = (axeResults.passes || []).map((p) => ({
    id: p.id,
    description: p.description,
    help: p.help,
  }));

  // Compute Summary
  let totalAffectedElements = 0;
  const byImpact = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };

  for (const v of violations) {
    totalAffectedElements += v.nodes.length;
    byImpact[v.impact] = (byImpact[v.impact] || 0) + 1;
  }

  const summary: ScanSummary = {
    totalViolations: violations.length,
    totalAffectedElements,
    byImpact,
    incompleteCount: incomplete.length,
    passedCount: passes.length,
  };

  const totalDuration = (options.fetchTimeMs || 0) + (Date.now() - startTime);

  return {
    targetUrl,
    finalUrl,
    timestamp: new Date().toISOString(),
    scanDurationMs: totalDuration,
    engine: {
      name: 'axe-core',
      version: axe.version || '4.10.x',
      environment: 'Serverless Node.js (JSDOM Virtual DOM)',
    },
    summary,
    violations,
    incomplete,
    passes,
    disclaimer: DISCLAIMER_TEXT,
    isDemo,
  };
}
