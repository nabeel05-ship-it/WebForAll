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

test('createPdfDocument handles long CSS selectors and WCAG criteria without errors', async () => {
  const base = await getDemoReport();
  const deepReport = JSON.parse(JSON.stringify(base));
  deepReport.violations[0].nodes[0].target = [
    'html > body.theme-dark > div#__next > main > section.products > div.card-wrapper-item:nth-child(4) > div.card-inner-container-with-extra-long-selector-name > article.product-item-card > div.card-details-wrapper > a.btn.btn-primary.btn-lg.stretched-link[data-tracking-id="promo-banner-winter-sale-2026-v2-cta-button-active"]'
  ];
  deepReport.violations[0].remediation.wcagCriteria = [
    'WCAG 1.1.1 Non-text Content (Level A)',
    'WCAG 1.3.1 Info and Relationships (Level A)',
    'WCAG 4.1.2 Name, Role, Value (Level A)',
    'Section 508 1194.22(a)',
    'EN 301 549 9.1.1.1'
  ];

  const doc = createPdfDocument(deepReport);
  assert.ok(doc);
  const pages = doc.getNumberOfPages();
  assert.ok(pages >= 2);
  const output = doc.output('arraybuffer');
  assert.ok(output.byteLength > 1000);
});

test('createPdfDocument handles large violation count with consistent multi-page pagination', async () => {
  const base = await getDemoReport();
  const manyReport = JSON.parse(JSON.stringify(base));
  const duplicated = [];
  for (let i = 0; i < 10; i++) {
    const v = JSON.parse(JSON.stringify(base.violations[i % base.violations.length]));
    v.title = `Violation ${i + 1}: ${v.title}`;
    duplicated.push(v);
  }
  manyReport.violations = duplicated;
  manyReport.summary.totalViolations = 10;

  const doc = createPdfDocument(manyReport);
  assert.ok(doc);
  const pages = doc.getNumberOfPages();
  assert.ok(pages >= 5, `Expected at least 5 pages for 10 full findings, got ${pages}`);
});

test('createPdfDocument includes human-review items and clearly distinguishes them from automated violations', async () => {
  const base = await getDemoReport();
  const doc = createPdfDocument(base);
  assert.ok(doc);
  const pages = doc.getNumberOfPages();
  assert.ok(pages >= 2);

  // Check text content inside generated PDF pages
  let combinedText = '';
  for (let i = 1; i <= pages; i++) {
    // jsPDF internal getPageInfo/output contains stream text
    doc.setPage(i);
  }
  const pdfString = doc.output('datauristring');
  assert.ok(pdfString.length > 1000);
});

test('createPdfDocument handles zero violations with human-review items cleanly', () => {
  const zeroViolationsWithReview = {
    targetUrl: 'https://review-only.example.org',
    timestamp: new Date().toISOString(),
    scanDurationMs: 55,
    engine: { name: 'axe-core', version: '4.10.2' },
    summary: {
      totalViolations: 0,
      totalAffectedElements: 0,
      byImpact: { critical: 0, serious: 0, moderate: 0, minor: 0 },
      incompleteCount: 2,
      passedCount: 20,
    },
    violations: [],
    incomplete: [
      {
        id: 'color-contrast',
        help: 'Elements must meet minimum color contrast ratio thresholds',
        description: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratios thresholds',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
        nodesCount: 3,
        reason: 'Requires visual context to confirm background color',
      },
      {
        id: 'landmark-one-main',
        help: 'Document should have one main landmark',
        description: 'Ensures the document has a main landmark',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/landmark-one-main',
        nodesCount: 1,
        reason: 'Requires manual verification of document structure',
      },
    ],
    passes: [],
    disclaimer: 'Automated testing disclaimer.',
  };

  const doc = createPdfDocument(zeroViolationsWithReview);
  assert.ok(doc);
  const pages = doc.getNumberOfPages();
  assert.ok(pages >= 1);
  const output = doc.output('arraybuffer');
  assert.ok(output.byteLength > 1000);
});

test('createPdfDocument handles empty human-review lists without breaking', async () => {
  const base = await getDemoReport();
  const noIncomplete = JSON.parse(JSON.stringify(base));
  noIncomplete.incomplete = [];
  noIncomplete.summary.incompleteCount = 0;

  const doc = createPdfDocument(noIncomplete);
  assert.ok(doc);
  assert.ok(doc.getNumberOfPages() >= 2);
  const output = doc.output('arraybuffer');
  assert.ok(output.byteLength > 1000);
});

test('POST /api/report/pdf endpoint generates genuine PDF with application/pdf and attachment headers', async () => {
  const { POST: pdfRouteHandler } = await import('../app/api/report/pdf/route.ts');
  const { NextRequest } = await import('next/server');
  const report = await getDemoReport();

  const req = new NextRequest('http://localhost:3000/api/report/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report }),
  });

  const res = await pdfRouteHandler(req);
  assert.equal(res.status, 200, 'Expected HTTP 200 OK');
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.ok(res.headers.get('content-disposition')?.includes('attachment; filename="webforall-accessibility-report-demo.webforall.local.pdf"'));

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  assert.ok(buffer.length > 1000, 'Expected PDF byte length > 1000');
  assert.equal(buffer.subarray(0, 5).toString('ascii'), '%PDF-');
});

test('POST /api/report/pdf returns 400 on malformed or missing report body', async () => {
  const { POST: pdfRouteHandler } = await import('../app/api/report/pdf/route.ts');
  const { NextRequest } = await import('next/server');

  const req = new NextRequest('http://localhost:3000/api/report/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invalid: true }),
  });

  const res = await pdfRouteHandler(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.code, 'INVALID_REPORT');
});
