// src/app/api/admin/places/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

// GET /api/admin/places  → proxied to  GET {BASE}/places
export async function GET(req: NextRequest) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const qs = req.nextUrl.search; // ?q=&page=&pageSize=...
    const url = `${apiBase()}/places${qs}`;

    const r = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Provider-Id': pid,
      },
      cache: 'no-store',
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: {
        'content-type': r.headers.get('content-type') || 'application/json',
      },
    });
  } catch (e: any) {
    console.error('[places:GET] proxy error:', e?.message || e);
    return NextResponse.json({ ok: false, error: 'Proxy error' }, { status: 500 });
  }
}

// POST /api/admin/places  → proxied to  POST {BASE}/places
export async function POST(req: NextRequest) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const r = await fetch(`${apiBase()}/places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Provider-Id': pid,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: {
        'content-type': r.headers.get('content-type') || 'application/json',
      },
    });
  } catch (e: any) {
    console.error('[places:POST] proxy error:', e?.message || e);
    return NextResponse.json({ ok: false, error: 'Proxy error' }, { status: 500 });
  }
}
