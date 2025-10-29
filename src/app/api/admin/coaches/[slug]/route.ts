


// /src/app/api/admin/coaches/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BASE = (process.env.NEXT_BACKEND_API_BASE || '').replace(/\/+$/, '');

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', 'http://localhost');
  res.headers.set('Vary', 'Origin');
  res.headers.set('Access-Control-Allow-Methods', 'GET,PATCH,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const upstream = await fetch(`${BASE}/coaches/${encodeURIComponent(params.slug)}`, { cache: 'no-store' });
  const body = await upstream.text();
  return cors(new NextResponse(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
  }));
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const payload = await req.text();
  const upstream = await fetch(`${BASE}/coaches/${encodeURIComponent(params.slug)}`, {
    method: 'PATCH',
    body: payload,
    headers: { 'content-type': 'application/json' },
  });
  const body = await upstream.text();
  return cors(new NextResponse(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
  }));
}

export async function DELETE(_: NextRequest, { params }: { params: { slug: string } }) {
  const upstream = await fetch(`${BASE}/coaches/${encodeURIComponent(params.slug)}`, { method: 'DELETE' });
  const body = await upstream.text();
  return cors(new NextResponse(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
  }));
}



