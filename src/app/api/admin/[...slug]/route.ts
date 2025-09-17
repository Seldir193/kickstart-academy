// app/api/admin/[...slug]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProviderId } from '@/app/api/lib/auth';

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  return raw.replace(/\/$/, '');
}

// Nur auth ausnehmen, damit /api/admin/bookings NICHT ausgeschlossen wird
const EXCLUDE_PREFIXES = ['auth'];

function shouldExclude(slug: string[]) {
  const first = (slug[0] || '').toLowerCase();
  return EXCLUDE_PREFIXES.includes(first);
}

function buildUpstreamUrl(BASE: string, slug: string[], req: NextRequest) {
  const parts = (slug || []).map(s => encodeURIComponent(s)).join('/');
  const qs = req.nextUrl.searchParams.toString();
  return `${BASE}/admin/${parts}${qs ? `?${qs}` : ''}`;
}

async function forward(req: NextRequest, upstreamUrl: string, providerId: string) {
  const method = req.method.toUpperCase();
  const hasBody = !['GET','HEAD'].includes(method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const headers: Record<string,string> = {
    'x-provider-id': providerId,
    'accept': req.headers.get('accept') || '*/*',
  };
  const ct = req.headers.get('content-type');
  if (ct) headers['content-type'] = ct;

  const up = await fetch(upstreamUrl, {
    method,
    headers,
    body: hasBody ? body : undefined,
    cache: 'no-store',
  });

  const res = new NextResponse(up.body, {
    status: up.status,
    headers: {
      'content-type': up.headers.get('content-type') || 'application/octet-stream',
      'content-disposition': up.headers.get('content-disposition') || '',
    },
  });
  const len = up.headers.get('content-length');
  if (len) res.headers.set('content-length', len);
  return res;
}

async function handler(req: NextRequest, ctx: { params: { slug?: string[] } }) {
  const BASE = baseFromEnv();
  if (!BASE) {
    return NextResponse.json({ ok:false, error:'NEXT_BACKEND_API_BASE is missing' }, { status:500 });
  }

  const slug = ctx.params.slug || [];
  if (shouldExclude(slug)) {
    // Lass deine speziellen /api/admin/auth/* Handler greifen
    return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
  }

  const providerId = await getProviderId(req); // 🔐 aus HttpOnly-JWT
  if (!providerId) {
    return NextResponse.json({ ok:false, error:'Unauthorized' }, { status:401 });
  }

  const upstreamUrl = buildUpstreamUrl(BASE, slug, req);
  try {
    return await forward(req, upstreamUrl, providerId);
  } catch (e: any) {
    return NextResponse.json({ ok:false, error:'Proxy error', detail:String(e?.message ?? e) }, { status:500 });
  }
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const HEAD    = handler;
export const OPTIONS = handler;










