// src/app/api/admin/customers/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const r = await fetch(`${apiBase()}/customers/${encodeURIComponent(params.id)}`, {
    headers: { 'X-Provider-Id': pid, Accept: 'application/json' },
    cache: 'no-store',
  });

  const body = await r.text();
  return new NextResponse(body, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const bodyIn = await req.json().catch(() => ({}));
  const r = await fetch(`${apiBase()}/customers/${encodeURIComponent(params.id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Provider-Id': pid,
      Accept: 'application/json',
    },
    body: JSON.stringify(bodyIn),
    cache: 'no-store',
  });

  const body = await r.text();
  return new NextResponse(body, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const r = await fetch(`${apiBase()}/customers/${encodeURIComponent(params.id)}`, {
    method: 'DELETE',
    headers: { 'X-Provider-Id': pid, Accept: 'application/json' },
    cache: 'no-store',
  });

  const body = await r.text();
  return new NextResponse(body, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}








