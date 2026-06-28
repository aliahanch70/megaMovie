import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  try {
    const res = await fetch(url, { method: 'HEAD' });
    const bytes = res.headers.get('content-length');
    if (!bytes) return NextResponse.json({ size: null });

    const mb = parseInt(bytes) / (1024 * 1024);
    const size = mb >= 1024
      ? `${(mb / 1024).toFixed(2)} GB`
      : `${mb.toFixed(0)} MB`;

    return NextResponse.json({ size });
  } catch {
    return NextResponse.json({ size: null });
  }
}
