// app/api/admin/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  return raw.replace(/\/$/, ''); // z.B. http://127.0.0.1:5000/api
}

export async function GET(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    console.error('[customers-proxy] NEXT_BACKEND_API_BASE missing');
    return NextResponse.json(
      { ok: false, error: 'NEXT_BACKEND_API_BASE missing' },
      { status: 500 }
    );
  }

  // 🔐 Nur aus HttpOnly-JWT lesen (keine Query/Client-Header/Klartext-Cookies)
  const providerId = await getProviderIdFromCookies();
  if (!providerId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Query 1:1 durchreichen
  const qs = req.nextUrl.searchParams.toString(); // ?q=&page=&limit=&sort=...
  const url = `${BASE}/customers${qs ? `?${qs}` : ''}`;

  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-provider-id': providerId, // ← aus JWT
      },
      cache: 'no-store',
    });

    const body = await r.text();
    return new NextResponse(body, {
      status: r.status,
      headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
    });
  } catch (e: any) {
    console.error('[customers-proxy] error:', e?.message || e);
    return NextResponse.json({ ok: false, error: e?.message || 'Proxy error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    console.error('[customers-proxy] NEXT_BACKEND_API_BASE missing');
    return NextResponse.json(
      { ok: false, error: 'NEXT_BACKEND_API_BASE missing' },
      { status: 500 }
    );
  }

  // 🔐 Nur JWT
  const providerId = await getProviderIdFromCookies();
  if (!providerId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  try {
    const r = await fetch(`${BASE}/customers`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        'x-provider-id': providerId,
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
    return NextResponse.json({ ok: false, error: e?.message || 'Proxy error' }, { status: 500 });
  }
}
