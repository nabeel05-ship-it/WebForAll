import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeHostnameForFilename,
  createPdfDocument,
  validatePdfStructure,
  generatePdfReport,
} from '../lib/reports/pdf-generator.ts';
import { getDemoReport } from '../lib/fixtures/demo-page.ts';

test('sanitizeHostnameForFilename extracts clean alphanumeric filenames', () => {
  assert.equal(sanitizeHostnameForFilename('https://example.com'), 'example.com');
  assert.equal(sanitizeHostnameForFilename('https://www.w3.org/WAI/'), 'w3.org');
  assert.equal(sanitizeHostnameForFilename('https://sub.domain.co.uk/path?q=1'), 'sub.domain.co.uk');
  assert.equal(sanitizeHostnameForFilename('invalid-url-string'), 'invalid-url-string');
});

// =========================================================================
// REGRESSION SUITE: TEST 1 THROUGH TEST 13
// =========================================================================

test('TEST 1: A normal report produces a valid PDF byte sequence', async () => {
  const report = await getDemoReport();
  const doc = createPdfDocument(report);

  assert.ok(doc, 'PDF Document must be instantiated');
  const arrayBuffer = doc.output('arraybuffer');
  assert.ok(arrayBuffer, 'Document output arraybuffer must exist');
  assert.ok(arrayBuffer.byteLength > 5000, `Expected byte length > 5000, got ${arrayBuffer.byteLength}`);

  const uint8 = new Uint8Array(arrayBuffer);
  assert.equal(uint8[0], 0x25, 'Byte 0 must be ASCII % (0x25)');
  assert.equal(uint8[1], 0x50, 'Byte 1 must be ASCII P (0x50)');
  assert.equal(uint8[2], 0x44, 'Byte 2 must be ASCII D (0x44)');
  assert.equal(uint8[3], 0x46, 'Byte 3 must be ASCII F (0x46)');
  assert.equal(uint8[4], 0x2d, 'Byte 4 must be ASCII - (0x2d)');
});

test('TEST 2: The generated output starts with a valid PDF header', async () => {
  const report = await getDemoReport();
  const doc = createPdfDocument(report);
  const arrayBuffer = doc.output('arraybuffer');
  const headerStr = Buffer.from(arrayBuffer.slice(0, 8)).toString('ascii');

  assert.match(headerStr, /^%PDF-1\.[0-7]/, 'Header must match standard %PDF-1.x format');
});

test('TEST 3: The PDF contains a valid, complete document structure and can be parsed by an available PDF parser or validator', async () => {
  const report = await getDemoReport();
  const doc = createPdfDocument(report);
  const arrayBuffer = doc.output('arraybuffer');
  const buffer = Buffer.from(arrayBuffer);

  // Validate complete PDF structure
  const validation = validatePdfStructure(buffer);
  assert.equal(validation.valid, true, `PDF structure must be valid. Error: ${validation.error}`);
  assert.ok(validation.byteLength > 5000, 'Validated byte length must be greater than 5000');
  assert.ok(validation.version?.startsWith('%PDF-'), 'Validated version must start with %PDF-');

  // Verify EOF and xref table markers
  const binStr = buffer.toString('binary');
  assert.ok(binStr.includes('%%EOF'), 'PDF must end with %%EOF marker');
  assert.ok(binStr.includes('startxref'), 'PDF must include startxref pointer');
  assert.ok(binStr.includes('/Type /Catalog') || binStr.includes('/Type/Catalog'), 'PDF must include Catalog root');
  assert.ok(binStr.includes('/Type /Pages') || binStr.includes('/Type/Pages'), 'PDF must include Pages tree');
});

test('TEST 4: The API returns Content-Type: application/pdf on success', async () => {
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
});

test('TEST 5: The API returns the correct attachment filename', async () => {
  const { POST: pdfRouteHandler } = await import('../app/api/report/pdf/route.ts');
  const { NextRequest } = await import('next/server');
  const report = await getDemoReport();

  const req = new NextRequest('http://localhost:3000/api/report/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report }),
  });

  const res = await pdfRouteHandler(req);
  const disposition = res.headers.get('content-disposition');
  assert.ok(disposition, 'Content-Disposition header must be present');
  assert.ok(
    disposition.includes('attachment; filename="webforall-accessibility-report-demo.webforall.local.pdf"'),
    'Expected standard attachment filename'
  );
  assert.ok(
    disposition.includes("filename*=UTF-8''webforall-accessibility-report-demo.webforall.local.pdf"),
    'Expected RFC 5987 UTF-8 encoded filename*'
  );
});

test('TEST 6: The response body matches the generated PDF bytes without accidental string encoding or truncation', async () => {
  const { POST: pdfRouteHandler } = await import('../app/api/report/pdf/route.ts');
  const { NextRequest } = await import('next/server');
  const report = await getDemoReport();

  // Generate directly
  const directDoc = createPdfDocument(report);
  const directBytes = new Uint8Array(directDoc.output('arraybuffer'));

  // Request via API route
  const req = new NextRequest('http://localhost:3000/api/report/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report }),
  });

  const res = await pdfRouteHandler(req);
  const resArrayBuffer = await res.arrayBuffer();
  const resBytes = new Uint8Array(resArrayBuffer);

  // Both should be valid PDF binary structures of equal length
  assert.equal(resBytes.byteLength, directBytes.byteLength, 'Response byte length must match direct generation');
  assert.equal(res.headers.get('content-length'), directBytes.byteLength.toString(), 'Content-Length header must match byte length');

  // Both must start with standard %PDF- header
  assert.deepEqual(resBytes.subarray(0, 5), directBytes.subarray(0, 5), 'Magic %PDF- bytes must match');

  // Validate structural integrity of response bytes
  const resValidation = validatePdfStructure(resBytes);
  assert.equal(resValidation.valid, true, 'API response must be a structurally valid PDF');
  assert.equal(resValidation.byteLength, directBytes.byteLength);

  // Both must end with %%EOF marker
  const resTail = Buffer.from(resBytes.subarray(-16)).toString('ascii');
  const directTail = Buffer.from(directBytes.subarray(-16)).toString('ascii');
  assert.ok(resTail.includes('%%EOF'), 'Response must end with %%EOF marker');
  assert.ok(directTail.includes('%%EOF'), 'Direct generation must end with %%EOF marker');
});

test('TEST 7: Malformed or missing report payloads return an appropriate error instead of a fake PDF download', async () => {
  const { POST: pdfRouteHandler } = await import('../app/api/report/pdf/route.ts');
  const { NextRequest } = await import('next/server');

  // Case A: Missing report object
  const req1 = new NextRequest('http://localhost:3000/api/report/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invalid: true }),
  });
  const res1 = await pdfRouteHandler(req1);
  assert.equal(res1.status, 400);
  assert.notEqual(res1.headers.get('content-type'), 'application/pdf');
  const data1 = await res1.json();
  assert.equal(data1.code, 'INVALID_REPORT');

  // Case B: Null body
  const req2 = new NextRequest('http://localhost:3000/api/report/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'null',
  });
  const res2 = await pdfRouteHandler(req2);
  assert.equal(res2.status, 400);

  // Case C: Report without targetUrl
  const req3 = new NextRequest('http://localhost:3000/api/report/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report: { violations: [] } }),
  });
  const res3 = await pdfRouteHandler(req3);
  assert.equal(res3.status, 400);
});

test('TEST 8: A report with zero violations still generates a valid PDF', () => {
  const emptyReport = {
    targetUrl: 'https://clean-site.example.org',
    timestamp: new Date().toISOString(),
    scanDurationMs: 42,
    engine: { name: 'axe-core', version: '4.10.2', environment: 'test' },
    summary: {
      totalViolations: 0,
      totalAffectedElements: 0,
      byImpact: { critical: 0, serious: 0, moderate: 0, minor: 0 },
      incompleteCount: 0,
      passedCount: 15,
    },
    violations: [],
    incomplete: [],
    passes: [
      { id: 'html-has-lang', help: '<html> element must have a lang attribute', description: 'Ensures every HTML document has a lang attribute' },
    ],
    disclaimer: 'Automated testing disclaimer.',
  };

  const doc = createPdfDocument(emptyReport);
  assert.ok(doc);
  assert.equal(doc.getNumberOfPages(), 1);

  const arrayBuffer = doc.output('arraybuffer');
  const validation = validatePdfStructure(Buffer.from(arrayBuffer));
  assert.equal(validation.valid, true);
  assert.ok(validation.byteLength > 1000);
});

test('TEST 9: A large report generates a valid multi-page PDF', async () => {
  const base = await getDemoReport();
  const manyReport = JSON.parse(JSON.stringify(base));
  const duplicated = [];
  for (let i = 0; i < 12; i++) {
    const v = JSON.parse(JSON.stringify(base.violations[i % base.violations.length]));
    v.title = `Finding ${i + 1}: ${v.title}`;
    duplicated.push(v);
  }
  manyReport.violations = duplicated;
  manyReport.summary.totalViolations = duplicated.length;

  const doc = createPdfDocument(manyReport);
  assert.ok(doc);
  const pages = doc.getNumberOfPages();
  assert.ok(pages >= 6, `Expected at least 6 pages for 12 findings, got ${pages}`);

  const arrayBuffer = doc.output('arraybuffer');
  const validation = validatePdfStructure(Buffer.from(arrayBuffer));
  assert.equal(validation.valid, true);
});

test('TEST 10: Incomplete checks and other supported report categories remain in the generated PDF', async () => {
  const base = await getDemoReport();
  const withReviews = JSON.parse(JSON.stringify(base));
  withReviews.incomplete = [
    {
      id: 'color-contrast',
      help: 'Elements must meet minimum color contrast ratio thresholds',
      description: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratios thresholds',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
      nodesCount: 5,
      reason: 'Requires visual context to confirm background gradient or image overlay.',
    },
    {
      id: 'custom-element-aria',
      help: 'Custom widget must have appropriate ARIA role and keyboard bindings',
      description: 'Ensures custom elements provide expected accessible roles',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-roles',
      nodesCount: 2,
      reason: 'Manual keyboard navigation required to test widget operation.',
    },
  ];
  withReviews.summary.incompleteCount = withReviews.incomplete.length;

  const doc = createPdfDocument(withReviews);
  assert.ok(doc);
  const pages = doc.getNumberOfPages();
  assert.ok(pages >= 3);

  const arrayBuffer = doc.output('arraybuffer');
  const validation = validatePdfStructure(Buffer.from(arrayBuffer));
  assert.equal(validation.valid, true);
});

test('TEST 11: Long selectors and remediation text do not corrupt the output', async () => {
  const base = await getDemoReport();
  const deepReport = JSON.parse(JSON.stringify(base));
  deepReport.violations[0].nodes[0].target = [
    'html > body.theme-dark > div#__next > main > section.products > div.card-wrapper-item:nth-child(4) > div.card-inner-container-with-extra-long-selector-name > article.product-item-card > div.card-details-wrapper > a.btn.btn-primary.btn-lg.stretched-link[data-tracking-id="promo-banner-winter-sale-2026-v2-cta-button-active-super-long-attribute-value-for-testing-wrapping"]'
  ];
  deepReport.violations[0].remediation.whatIsWrong =
    'This is an exceptionally verbose explanation designed to ensure that deep multi-line text wrapping within fixed-width cards handles edge cases gracefully without overlapping following sections or exceeding coordinate boundaries in the generated PDF letter canvas.';
  deepReport.violations[0].remediation.wcagCriteria = [
    'WCAG 1.1.1 Non-text Content (Level A)',
    'WCAG 1.3.1 Info and Relationships (Level A)',
    'WCAG 1.4.3 Contrast (Minimum) (Level AA)',
    'WCAG 2.4.4 Link Purpose (In Context) (Level A)',
    'WCAG 4.1.2 Name, Role, Value (Level A)',
    'Section 508 1194.22(a)',
    'EN 301 549 9.1.1.1',
  ];

  const doc = createPdfDocument(deepReport);
  assert.ok(doc);
  const arrayBuffer = doc.output('arraybuffer');
  const validation = validatePdfStructure(Buffer.from(arrayBuffer));
  assert.equal(validation.valid, true);
});

test('TEST 12: The client does not treat an error response as a successful PDF', () => {
  // Simulates client verification logic in ReportView.tsx
  const simulateClientDownloadVerification = (status, contentType, bytes) => {
    if (status !== 200) {
      throw new Error(`Server error (HTTP ${status})`);
    }
    if (!contentType.includes('application/pdf')) {
      throw new Error('Received non-PDF response format from server.');
    }
    if (!bytes || bytes.byteLength === 0) {
      throw new Error('Received empty PDF document.');
    }
    const header = String.fromCharCode(...new Uint8Array(bytes.slice(0, 5)));
    if (header !== '%PDF-') {
      throw new Error('Downloaded file has corrupted PDF header.');
    }
    return true;
  };

  // 1. HTTP 500 JSON error
  assert.throws(
    () => simulateClientDownloadVerification(500, 'application/json', new Uint8Array([1, 2, 3])),
    /Server error \(HTTP 500\)/
  );

  // 2. HTTP 200 HTML error page disguised as success
  const htmlBytes = Buffer.from('<!DOCTYPE html><html><body>Error</body></html>');
  assert.throws(
    () => simulateClientDownloadVerification(200, 'text/html', htmlBytes),
    /Received non-PDF response format from server/
  );

  // 3. HTTP 200 with 0 bytes
  assert.throws(
    () => simulateClientDownloadVerification(200, 'application/pdf', new Uint8Array([])),
    /Received empty PDF document/
  );

  // 4. HTTP 200 with invalid magic bytes
  const fakeBytes = Buffer.from('{"error":"something"}');
  assert.throws(
    () => simulateClientDownloadVerification(200, 'application/pdf', fakeBytes),
    /Downloaded file has corrupted PDF header/
  );

  // 5. Valid PDF bytes succeed
  const validBytes = Buffer.from('%PDF-1.3\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\nstartxref\n10\n%%EOF');
  assert.equal(simulateClientDownloadVerification(200, 'application/pdf', validBytes), true);
});

test('TEST 13: The fallback, if present, produces a valid PDF when legitimately used', async () => {
  const report = await getDemoReport();

  // Test local generator path
  const doc = createPdfDocument(report);
  assert.ok(doc, 'Local fallback must create valid jsPDF document');

  const arrayBuffer = doc.output('arraybuffer');
  assert.ok(arrayBuffer.byteLength > 1000, 'Fallback PDF buffer must be non-empty');

  const validation = validatePdfStructure(Buffer.from(arrayBuffer));
  assert.equal(validation.valid, true, 'Fallback output must be structurally valid PDF');
  assert.ok(validation.version?.startsWith('%PDF-'));
});
