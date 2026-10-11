import { NextResponse } from 'next/server';
import { getDemoReport } from '@/lib/fixtures/demo-page';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await getDemoReport();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate demo report.',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
