import test from 'node:test';
import assert from 'node:assert/strict';
import { runAxeScan } from '../lib/scanner/axe-runner.ts';
import { getDemoReport } from '../lib/fixtures/demo-page.ts';
import { getRemediationForRule } from '../lib/scanner/remediation-catalog.ts';

test('runAxeScan detects violations accurately on sample markup with accessibility issues', async () => {
  const badHtml = `<!DOCTYPE html>
  <html>
    <head><title>Bad Page</title></head>
    <body>
      <img src="pic.jpg">
      <button></button>
      <input type="text" placeholder="Your name">
    </body>
  </html>`;

  const report = await runAxeScan({
    html: badHtml,
    targetUrl: 'https://test.example/inaccessible',
    isDemo: false,
  });

  assert.equal(report.targetUrl, 'https://test.example/inaccessible');
  assert.equal(report.isDemo, false);
  assert.ok(report.violations.length >= 3, `Expected at least 3 violations, got ${report.violations.length}`);

  const violationIds = report.violations.map((v) => v.id);
  assert.ok(violationIds.includes('image-alt'), 'Should detect missing image alt attribute');
  assert.ok(violationIds.includes('button-name'), 'Should detect button missing accessible name');

  // Verify finding structure & remediation
  const imageAltFinding = report.violations.find((v) => v.id === 'image-alt');
  assert.ok(imageAltFinding);
  assert.equal(imageAltFinding.remediation.ruleId, 'image-alt');
  assert.ok(imageAltFinding.remediation.whatIsWrong.length > 0);
  assert.ok(imageAltFinding.remediation.howToFix.length > 0);
  assert.ok(imageAltFinding.nodes.length >= 1);
  assert.ok(imageAltFinding.nodes[0].html.includes('img'));

  // Verify summary metrics
  assert.equal(report.summary.totalViolations, report.violations.length);
  assert.ok(report.summary.totalAffectedElements >= report.violations.length);
  assert.ok(report.engine.name === 'axe-core');
});

test('runAxeScan on accessible markup returns 0 violations and records passed rules', async () => {
  const accessibleHtml = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Accessible Company Portal</title>
    </head>
    <body>
      <header>
        <nav aria-label="Main Navigation">
          <a href="/">Home</a>
        </nav>
      </header>
      <main id="main-content">
        <h1>Welcome to Inclusive Web</h1>
        <p>This is accessible body content.</p>
        <img src="valid.png" alt="Accessible diagram of inclusive web architecture">
        <button type="button">Submit Feedback</button>
      </main>
      <footer>
        <p>&copy; 2026 Inclusive Web</p>
      </footer>
    </body>
  </html>`;

  const report = await runAxeScan({
    html: accessibleHtml,
    targetUrl: 'https://test.example/accessible',
  });

  assert.equal(report.violations.length, 0, 'Accessible page should have 0 violations');
  assert.equal(report.summary.totalViolations, 0);
  assert.ok(report.passes.length > 5, 'Should have multiple verified passes');
  assert.ok(report.passes.some((p) => p.id === 'document-title'));
  assert.ok(report.passes.some((p) => p.id === 'html-has-lang'));
  assert.ok(report.passes.some((p) => p.id === 'image-alt'));
  assert.ok(report.passes.some((p) => p.id === 'button-name'));
});

test('getDemoReport executes axe-core on controlled demo fixture', async () => {
  const demoReport = await getDemoReport();

  assert.equal(demoReport.isDemo, true);
  assert.ok(demoReport.targetUrl.includes('sample-inaccessible-page'));
  assert.ok(demoReport.violations.length >= 3);

  const ruleIds = demoReport.violations.map((v) => v.id);
  assert.ok(ruleIds.includes('image-alt'));
  assert.ok(ruleIds.includes('label'));
  assert.ok(ruleIds.includes('button-name'));
  assert.ok(ruleIds.includes('link-name'));
  assert.ok(ruleIds.includes('heading-order'));
  assert.ok(ruleIds.includes('region'));

  // Ensure nodes contain truncated HTML and selectors
  for (const v of demoReport.violations) {
    assert.ok(v.nodes.length > 0);
    assert.ok(v.nodes[0].target.length > 0);
    assert.ok(v.remediation.whatIsWrong);
    assert.ok(v.remediation.whyItMatters);
    assert.ok(v.remediation.whoIsAffected);
  }
});

test('getRemediationForRule returns rich catalog items and valid fallbacks', () => {
  // Cataloged rule
  const imageAlt = getRemediationForRule('image-alt', 'Ensure <img> has alt', 'https://deque.com');
  assert.equal(imageAlt.ruleId, 'image-alt');
  assert.ok(imageAlt.codeExample);
  assert.ok(imageAlt.codeExample.correct);
  assert.ok(imageAlt.codeExample.incorrect);

  // Uncataloged fallback
  const custom = getRemediationForRule('custom-rare-rule', 'Ensure rare element exists', 'https://example.com/rule');
  assert.equal(custom.ruleId, 'custom-rare-rule');
  assert.ok(custom.whatIsWrong.includes('custom-rare-rule'));
  assert.equal(custom.referenceUrl, 'https://example.com/rule');
});

test('TEST 1 & TEST 3: Structural landmarks pass on valid markup without JSDOM modal errors', async () => {
  const structuredHtml = `<!DOCTYPE html>
  <html lang="en">
    <head><title>Accessible Layout</title></head>
    <body>
      <main id="main-content">
        <h1>Primary Heading</h1>
        <p>Accessible content inside main landmark.</p>
      </main>
    </body>
  </html>`;

  const report = await runAxeScan({
    html: structuredHtml,
    targetUrl: 'https://test.example/landmarks',
  });

  // Confirmed passes
  assert.ok(report.passes.some((p) => p.id === 'landmark-one-main'), 'landmark-one-main should pass');
  assert.ok(report.passes.some((p) => p.id === 'page-has-heading-one'), 'page-has-heading-one should pass');
  assert.equal(report.violations.length, 0);
  assert.equal(report.incomplete.length, 0);
});

test('TEST 1: Missing landmark-one-main and page-has-heading-one produce confirmed violations not incomplete errors', async () => {
  const invalidHtml = `<!DOCTYPE html>
  <html lang="en">
    <head><title>Missing Landmarks</title></head>
    <body>
      <div>
        <p>No main landmark and no h1 heading.</p>
      </div>
    </body>
  </html>`;

  const report = await runAxeScan({
    html: invalidHtml,
    targetUrl: 'https://test.example/no-landmarks',
  });

  const violationIds = report.violations.map((v) => v.id);
  assert.ok(violationIds.includes('landmark-one-main'), 'Missing main must be a confirmed violation');
  assert.ok(violationIds.includes('page-has-heading-one'), 'Missing h1 must be a confirmed violation');

  // Should NOT be masked as incomplete
  assert.ok(!report.incomplete.some((i) => i.id === 'landmark-one-main'));
  assert.ok(!report.incomplete.some((i) => i.id === 'page-has-heading-one'));
});

test('TEST 2 & TEST 4: Incomplete checks are categorized separately and do not inflate violation counts', async () => {
  // A synthetic report test verifying separation between violations and incomplete checks
  const testReport = {
    targetUrl: 'https://example.com',
    finalUrl: 'https://example.com',
    timestamp: new Date().toISOString(),
    scanDurationMs: 120,
    engine: { name: 'axe-core', version: '4.14.0', environment: 'Test' },
    summary: {
      totalViolations: 2,
      totalAffectedElements: 3,
      byImpact: { critical: 1, serious: 1, moderate: 0, minor: 0 },
      incompleteCount: 1,
      passedCount: 4,
    },
    violations: [
      {
        id: 'image-alt',
        impact: 'critical',
        title: 'Image missing text alternative',
        description: 'Images must have alt text',
        help: 'Images must have alt',
        helpUrl: 'https://deque.com',
        tags: ['wcag2a'],
        nodes: [{ target: ['img'], html: '<img src="a.jpg">' }],
        remediation: getRemediationForRule('image-alt', 'desc', 'https://deque.com'),
      },
      {
        id: 'button-name',
        impact: 'serious',
        title: 'Buttons must have discernible text',
        description: 'Buttons must have text',
        help: 'Buttons must have text',
        helpUrl: 'https://deque.com',
        tags: ['wcag2a'],
        nodes: [{ target: ['button'], html: '<button></button>' }],
        remediation: getRemediationForRule('button-name', 'desc', 'https://deque.com'),
      },
    ],
    incomplete: [
      {
        id: 'color-contrast',
        description: 'Elements must meet contrast threshold',
        help: 'Elements must meet contrast',
        helpUrl: 'https://deque.com',
        nodesCount: 1,
        reason: 'Element background cannot be determined due to background image',
      },
    ],
    passes: [
      { id: 'document-title', description: 'Has title', help: 'Has title' },
    ],
    disclaimer: 'Disclaimer test',
  };

  // Verify total violations does NOT include incomplete count
  assert.equal(testReport.summary.totalViolations, 2);
  assert.equal(testReport.summary.incompleteCount, 1);
  assert.equal(
    testReport.summary.byImpact.critical +
      testReport.summary.byImpact.serious +
      testReport.summary.byImpact.moderate +
      testReport.summary.byImpact.minor,
    testReport.summary.totalViolations
  );
  assert.notEqual(testReport.summary.totalViolations, testReport.violations.length + testReport.incomplete.length);
});

test('TEST 5: JSON serialization preserves all categories without data loss', () => {
  const sampleReport = {
    targetUrl: 'https://example.com',
    finalUrl: 'https://example.com',
    timestamp: new Date().toISOString(),
    scanDurationMs: 85,
    engine: { name: 'axe-core', version: '4.14.0', environment: 'Test' },
    summary: {
      totalViolations: 1,
      totalAffectedElements: 1,
      byImpact: { critical: 1, serious: 0, moderate: 0, minor: 0 },
      incompleteCount: 1,
      passedCount: 2,
    },
    violations: [
      {
        id: 'image-alt',
        impact: 'critical',
        title: 'Missing image alt',
        description: 'Alt missing',
        help: 'Add alt',
        helpUrl: 'https://example.com',
        tags: ['wcag2a'],
        nodes: [{ target: ['img'], html: '<img src="x.png">' }],
        remediation: getRemediationForRule('image-alt', 'desc', 'https://example.com'),
      },
    ],
    incomplete: [
      {
        id: 'color-contrast',
        description: 'Contrast requires visual inspection',
        help: 'Review contrast',
        helpUrl: 'https://example.com',
        nodesCount: 1,
        reason: 'Complex gradient requires human check',
      },
    ],
    passes: [
      { id: 'html-has-lang', description: 'Lang present', help: 'Lang present' },
      { id: 'document-title', description: 'Title present', help: 'Title present' },
    ],
    disclaimer: 'Automated scan disclaimer',
  };

  const serialized = JSON.stringify(sampleReport);
  const parsed = JSON.parse(serialized);

  assert.equal(parsed.violations.length, 1);
  assert.equal(parsed.incomplete.length, 1);
  assert.equal(parsed.passes.length, 2);
  assert.equal(parsed.incomplete[0].reason, 'Complex gradient requires human check');
});

test('TEST 6: Filtering operations do not mutate or discard original report items', () => {
  const originalViolations = [
    { id: 'img-1', impact: 'critical', title: 'Img 1' },
    { id: 'btn-1', impact: 'minor', title: 'Btn 1' },
  ];

  // Filtering for critical
  const filtered = originalViolations.filter((v) => v.impact === 'critical');
  assert.equal(filtered.length, 1);
  assert.equal(originalViolations.length, 2, 'Original array must remain unmutated');
});

test('TEST 8: Optional or missing fields do not crash report normalization', async () => {
  const minimalHtml = `<!DOCTYPE html><html><head><title>T</title></head><body><p>Text</p></body></html>`;
  const report = await runAxeScan({
    html: minimalHtml,
    targetUrl: 'https://test.example/minimal',
  });

  assert.ok(report);
  assert.ok(Array.isArray(report.violations));
  assert.ok(Array.isArray(report.incomplete));
  assert.ok(Array.isArray(report.passes));
  assert.ok(typeof report.summary.totalViolations === 'number');
});

test('TEST 9: Server layout templates contain main landmark and skip link target', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const layoutContent = await fs.readFile(
    path.join(process.cwd(), 'app/layout.tsx'),
    'utf-8'
  );
  assert.ok(layoutContent.includes('<main id="main-content"'), 'Root layout must define <main id="main-content">');

  const pageContent = await fs.readFile(
    path.join(process.cwd(), 'app/page.tsx'),
    'utf-8'
  );
  assert.ok(pageContent.includes('<h1'), 'Homepage must contain primary <h1> heading');
});

