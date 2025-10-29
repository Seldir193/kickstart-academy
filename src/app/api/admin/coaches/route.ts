// /src/app/api/admin/coaches/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BASE = (process.env.NEXT_BACKEND_API_BASE || '').replace(/\/+$/, '');

function cors(res: NextResponse) {
  // Admin wird nur aus deinem Next-Admin genutzt – wir lassen's offen für localhost
  res.headers.set('Access-Control-Allow-Origin', 'http://localhost');
  res.headers.set('Vary', 'Origin');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  const upstream = await fetch(`${BASE}/coaches${req.nextUrl.search}`, { cache: 'no-store' });
  const body = await upstream.text();
  return cors(new NextResponse(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
  }));
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const upstream = await fetch(`${BASE}/coaches`, {
    method: 'POST',
    body: payload,
    headers: { 'content-type': 'application/json' },
  });
  const body = await upstream.text();
  return cors(new NextResponse(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
  }));
}
