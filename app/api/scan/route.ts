import { NextRequest, NextResponse } from 'next/server';
import { safeFetchHtml } from '@/lib/security/safe-fetch';
import { runAxeScan } from '@/lib/scanner/axe-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid website URL in the request body.',
          code: 'MISSING_URL',
        },
        { status: 400 }
      );
    }

    const rawUrl = body.url.trim();

    if (!rawUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'The website URL cannot be empty.',
          code: 'EMPTY_URL',
        },
        { status: 400 }
      );
    }

    // Safely fetch HTML with SSRF defense, redirect resolution, and byte limits
    const fetchResult = await safeFetchHtml(rawUrl);

    if (fetchResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: fetchResult.error.error,
          code: fetchResult.error.code,
          statusCode: fetchResult.error.statusCode,
          attemptedUrl: fetchResult.error.attemptedUrl,
        },
        { status: 422 }
      );
    }

    const { html, finalUrl, fetchTimeMs } = fetchResult.data!;

    // Run axe-core engine on the retrieved DOM
    const report = await runAxeScan({
      html,
      targetUrl: rawUrl,
      finalUrl,
      isDemo: false,
      fetchTimeMs,
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Internal scanning error: ${error.message || 'An unexpected failure occurred while evaluating the page.'}`,
        code: 'SCAN_FAILED',
      },
      { status: 500 }
    );
  }
}
