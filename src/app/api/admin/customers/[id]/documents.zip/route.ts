

















export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

// GET /api/admin/customers/:id/documents.zip
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });
    }

    const qs = req.nextUrl.searchParams.toString();
    const url = `${apiBase()}/customers/${encodeURIComponent(params.id)}/documents.zip${qs ? `?${qs}` : ''}`;

    const r = await fetch(url, { method: 'GET', headers: { 'x-provider-id': pid }, cache: 'no-store' });
    const buf = await r.arrayBuffer();

    return new NextResponse(buf, {
      status: r.status,
      headers: {
        'Content-Type': r.headers.get('content-type') || 'application/zip',
        'Content-Disposition': r.headers.get('content-disposition') || `attachment; filename="customer-${params.id}-documents.zip"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Proxy failed', detail: String(e?.message ?? e) }, { status: 500 });
  }
}
