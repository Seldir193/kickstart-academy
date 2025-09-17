// src/app/api/admin/places/[id]/route.ts
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

// GET /api/admin/places/:id  →  GET {BASE}/places/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const r = await fetch(`${apiBase()}/places/${encodeURIComponent(params.id)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'X-Provider-Id': pid },
      cache: 'no-store',
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
    });
  } catch (e: any) {
    console.error('[places:id GET] proxy error:', e?.message || e);
    return NextResponse.json({ ok: false, error: 'Proxy error' }, { status: 500 });
  }
}

// PUT /api/admin/places/:id  →  PUT {BASE}/places/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const r = await fetch(`${apiBase()}/places/${encodeURIComponent(params.id)}`, {
      method: 'PUT',
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
      headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
    });
  } catch (e: any) {
    console.error('[places:id PUT] proxy error:', e?.message || e);
    return NextResponse.json({ ok: false, error: 'Proxy error' }, { status: 500 });
  }
}

// DELETE /api/admin/places/:id  →  DELETE {BASE}/places/:id
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const r = await fetch(`${apiBase()}/places/${encodeURIComponent(params.id)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'X-Provider-Id': pid },
      cache: 'no-store',
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
    });
  } catch (e: any) {
    console.error('[places:id DELETE] proxy error:', e?.message || e);
    return NextResponse.json({ ok: false, error: 'Proxy error' }, { status: 500 });
  }
}
