import { NextResponse } from 'next/server';
import { DEMO_HTML } from '@/lib/fixtures/demo-fixture';

export const runtime = 'nodejs';

export async function GET() {
  return new NextResponse(DEMO_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
