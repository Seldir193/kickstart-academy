// app/api/admin/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    '';
  return (raw || '').replace(/\/$/, ''); // z.B. http://127.0.0.1:5000/api
}

function getProviderId(req: NextRequest): string | null {
  // 1) Header (falls gesetzt)
  const h = req.headers.get('x-provider-id');
  if (h && h.trim()) return h.trim();

  // 2) Cookies (vom Admin-Login)
  const c =
    req.cookies.get('providerId')?.value ||
    req.cookies.get('adminProviderId')?.value ||
    req.cookies.get('aid')?.value;
  if (c && String(c).trim()) return String(c).trim();

  // 3) Optional: ?providerId=... (für lokale Tests)
  const q = req.nextUrl.searchParams.get('providerId');
  if (q && q.trim()) return q.trim();

  return null;
}

export async function GET(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    console.error('[customers-proxy] NEXT_BACKEND_API_BASE missing');
    return NextResponse.json({ ok:false, error:'NEXT_BACKEND_API_BASE missing' }, { status: 500 });
  }

  const providerId = getProviderId(req);
  if (!providerId) {
    return NextResponse.json({ ok:false, error:'Missing provider id' }, { status: 401 });
  }

  const qs = req.nextUrl.searchParams.toString(); // ?q=&page=&limit=&sort=...
  const url = `${BASE}/customers${qs ? `?${qs}` : ''}`;
  console.log('[customers-proxy] →', url, 'pid=', providerId);

  try {
    const r = await fetch(url, {
      headers: { 'x-provider-id': providerId, 'accept': 'application/json' },
      cache: 'no-store',
    });

    const body = await r.text();
    return new NextResponse(body, {
      status: r.status,
      headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
    });
  } catch (e: any) {
    console.error('[customers-proxy] error:', e?.message || e);
    return NextResponse.json({ ok:false, error: e?.message || 'Proxy error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    console.error('[customers-proxy] NEXT_BACKEND_API_BASE missing');
    return NextResponse.json({ ok:false, error:'NEXT_BACKEND_API_BASE missing' }, { status: 500 });
  }

  const providerId = getProviderId(req);
  if (!providerId) {
    return NextResponse.json({ ok:false, error:'Missing provider id' }, { status: 401 });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  try {
    const r = await fetch(`${BASE}/customers`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-provider-id': providerId,
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
    });
  } catch (e: any) {
    console.error('[customers-proxy:POST] error:', e?.message || e);
    return NextResponse.json({ ok:false, error: e?.message || 'Proxy error' }, { status: 500 });
  }
}









