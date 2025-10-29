// /src/app/api/coaches/route.ts  (öffentliche Liste – für WordPress)
import { NextRequest, NextResponse } from 'next/server';

const BASE = (process.env.NEXT_BACKEND_API_BASE || '').replace(/\/+$/, '');
// z.B. http://127.0.0.1:5000/api

function cors(res: NextResponse) {
  // WP-Frontend läuft auf http://localhost
  res.headers.set('Access-Control-Allow-Origin', 'http://localhost');
  res.headers.set('Vary', 'Origin');
  res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
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

