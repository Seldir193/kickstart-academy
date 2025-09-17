// app/api/admin/bookings/[id]/documents/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProviderId } from '@/app/api/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  return raw.replace(/\/$/, '');
}

export async function GET(
  req: NextRequest,
  ctx: { params: { id: string; type: string } }
) {
  const BASE = baseFromEnv();
  const { id, type } = ctx.params;

  // nur erlaubte Dokumenttypen
  const ALLOWED = new Set(['participation', 'cancellation', 'storno']);
  if (!ALLOWED.has(type)) {
    return NextResponse.json({ ok: false, error: 'Invalid document type' }, { status: 400 });
  }

  // 🔐 ProviderId ausschließlich aus HttpOnly-JWT
  const providerId = await getProviderId(req);
  if (!providerId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Upstream-URL (wie in deinem Kommentar beschrieben)
  const url = `${BASE}/admin/customers/bookings/${encodeURIComponent(id)}/documents/${encodeURIComponent(type)}`;

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'x-provider-id': providerId,
        'accept': 'application/pdf,application/octet-stream,application/json,*/*',
      },
      cache: 'no-store',
      redirect: 'follow',
    });

    // Stream direkt durchreichen; Header übernehmen/fallbacken
    const res = new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || (upstream.ok ? 'application/pdf' : 'application/json'),
        'content-disposition': upstream.headers.get('content-disposition') || '',
      },
    });
    const len = upstream.headers.get('content-length');
    if (len) res.headers.set('content-length', len);

    return res;
  } catch (e: any) {
    console.error('[doc-proxy] error:', e?.message || e);
    return NextResponse.json({ ok: false, error: e?.message || 'Proxy error' }, { status: 500 });
  }
}
