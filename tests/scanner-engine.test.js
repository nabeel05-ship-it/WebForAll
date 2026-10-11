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
