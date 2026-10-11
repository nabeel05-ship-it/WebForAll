import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeHostnameForFilename, createPdfDocument } from '../lib/reports/pdf-generator.ts';
import { getDemoReport } from '../lib/fixtures/demo-page.ts';

test('sanitizeHostnameForFilename extracts clean alphanumeric filenames', () => {
  assert.equal(sanitizeHostnameForFilename('https://example.com'), 'example.com');
  assert.equal(sanitizeHostnameForFilename('https://www.w3.org/WAI/'), 'w3.org');
  assert.equal(sanitizeHostnameForFilename('https://sub.domain.co.uk/path?q=1'), 'sub.domain.co.uk');
  assert.equal(sanitizeHostnameForFilename('invalid-url-string'), 'invalid-url-string');
});

test('createPdfDocument generates genuine multi-page PDF from real report fixture', async () => {
  const report = await getDemoReport();
  const doc = createPdfDocument(report);

  assert.ok(doc, 'Document was generated');
  const pages = doc.getNumberOfPages();
  assert.ok(pages >= 2, `Expected multi-page PDF, got ${pages} pages`);

  // Verify binary output exists and is non-empty
  const output = doc.output('arraybuffer');
  assert.ok(output.byteLength > 1000, `Expected PDF buffer length > 1000, got ${output.byteLength}`);

  // Check PDF magic header '%PDF-'
  const header = Buffer.from(output.slice(0, 5)).toString('ascii');
  assert.equal(header, '%PDF-', 'PDF file must start with valid %PDF- magic bytes');
});

test('createPdfDocument handles zero violations report cleanly', () => {
  const emptyReport = {
    targetUrl: 'https://clean-site.example.org',
    timestamp: new Date().toISOString(),
    scanDurationMs: 42,
    engine: { name: 'axe-core', version: '4.10.2' },
    summary: {
      totalViolations: 0,
      totalAffectedElements: 0,
      byImpact: { critical: 0, serious: 0, moderate: 0, minor: 0 },
      incompleteCount: 0,
      passedCount: 15,
    },
    violations: [],
    incomplete: [],
    passes: [{ id: 'html-has-lang', help: '<html> element must have a lang attribute', description: 'Ensures every HTML document has a lang attribute' }],
    disclaimer: 'Automated testing disclaimer.',
  };

  const doc = createPdfDocument(emptyReport);
  assert.ok(doc);
  assert.equal(doc.getNumberOfPages(), 1);
  const output = doc.output('arraybuffer');
  assert.ok(output.byteLength > 500);
});
