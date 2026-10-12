import { NextRequest, NextResponse } from 'next/server';
import { createPdfDocument, sanitizeHostnameForFilename } from '@/lib/reports/pdf-generator';
import { AccessibilityReport } from '@/lib/scanner/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.report || typeof body.report !== 'object' || !body.report.targetUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: A valid AccessibilityReport object is required.',
          code: 'INVALID_REPORT',
        },
        { status: 400 }
      );
    }

    const report: AccessibilityReport = body.report;

    // Generate genuine PDF document
    const doc = createPdfDocument(report);
    const pdfArrayBuffer = doc.output('arraybuffer');
    const uint8Array = new Uint8Array(pdfArrayBuffer);

    if (!uint8Array || uint8Array.byteLength === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'PDF document generation resulted in empty output.',
          code: 'PDF_EMPTY',
        },
        { status: 500 }
      );
    }

    const host = sanitizeHostnameForFilename(report.targetUrl);
    const filename = `webforall-accessibility-report-${host}.pdf`;

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Access-Control-Expose-Headers': 'Content-Disposition',
        'Content-Length': uint8Array.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate PDF report: ${error.message || 'An unexpected failure occurred while creating the PDF.'}`,
        code: 'PDF_GENERATION_FAILED',
      },
      { status: 500 }
    );
  }
}
