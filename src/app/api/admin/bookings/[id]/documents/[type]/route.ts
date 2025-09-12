// app/api/admin/bookings/[id]/documents/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  return raw.replace(/\/$/, '');
}

function getProviderId(req: NextRequest): string | null {
  // 1) Header
  const h = req.headers.get('x-provider-id');
  if (h && h.trim()) return h.trim();
  // 2) Cookies (vom Admin-Login)
  const c =
    req.cookies.get('providerId')?.value ||
    req.cookies.get('adminProviderId')?.value ||
    req.cookies.get('aid')?.value;
  if (c && String(c).trim()) return String(c).trim();
  // 3) Query (?providerId=...)
  const q = req.nextUrl.searchParams.get('providerId');
  if (q && q.trim()) return q.trim();
  return null;
}

export async function GET(
  req: NextRequest,
  ctx: { params: { id: string; type: string } }
) {
  const BASE = baseFromEnv();
  const { id, type } = ctx.params;

  const ALLOWED = new Set(['participation', 'cancellation', 'storno']);
  if (!ALLOWED.has(type)) {
    return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
  }

  const providerId = getProviderId(req);
  if (!providerId) {
    return NextResponse.json({ ok: false, error: 'Missing provider id' }, { status: 401 });
  }

  // Backend-Alias lebt unter /api/admin/customers/...
  const url = `${BASE}/admin/customers/bookings/${encodeURIComponent(
    id
  )}/documents/${encodeURIComponent(type)}`;

  try {
    const r = await fetch(url, {
      headers: { 'x-provider-id': providerId },
      cache: 'no-store',
      redirect: 'follow',
    });

    const buf = await r.arrayBuffer();
    const headers: Record<string, string> = {
      'content-type': r.headers.get('content-type') || (r.ok ? 'application/pdf' : 'application/json'),
    };
    const cd = r.headers.get('content-disposition');
    if (cd) headers['content-disposition'] = cd;

    return new NextResponse(Buffer.from(buf), { status: r.status, headers });
  } catch (e: any) {
    console.error('[doc-proxy] error:', e?.message || e);
    return NextResponse.json({ ok: false, error: e?.message || 'Proxy error' }, { status: 500 });
  }
}
