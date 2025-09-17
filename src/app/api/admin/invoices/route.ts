// app/api/admin/invoices/route.ts
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

export async function GET(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    console.error('[invoices-proxy] NEXT_BACKEND_API_BASE is missing');
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: NEXT_BACKEND_API_BASE is missing' },
      { status: 500 }
    );
  }

  // 🔐 providerId ausschließlich aus JWT (HttpOnly) — keine Header/Query/Cookie vom Client akzeptieren
  const providerId = await getProviderId(req);
  if (!providerId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Query 1:1 durchreichen
  const qs = req.nextUrl.searchParams.toString();
  const url = `${BASE}/admin/invoices${qs ? `?${qs}` : ''}`;

  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-provider-id': providerId, // ← aus JWT, nicht vom Client
      },
      cache: 'no-store',
    });

    const body = await r.text();
    return new NextResponse(body, {
      status: r.status,
      headers: {
        'content-type': r.headers.get('content-type') || 'application/json',
      },
    });
  } catch (e: any) {
    console.error('[invoices-proxy] fetch error:', e?.message || e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'Proxy error' },
      { status: 500 }
    );
  }
}












