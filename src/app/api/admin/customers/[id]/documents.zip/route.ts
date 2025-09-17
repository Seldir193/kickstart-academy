
// app/api/admin/customers/[id]/documents.zip/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

const API_BASE = (process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api').replace(/\/+$/, '');

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });
    }

    const qs = req.nextUrl.searchParams.toString();
    const url = `${API_BASE}/customers/${encodeURIComponent(params.id)}/documents.zip${qs ? `?${qs}` : ''}`;

    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Provider-Id': pid,          // konsistent großgeschrieben
        'Accept': 'application/zip',
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return NextResponse.json(
        { ok: false, status: upstream.status, error: 'Upstream failed', detail: text.slice(0, 2000) },
        { status: upstream.status }
      );
    }

    const headers = new Headers();
    headers.set('Content-Type', upstream.headers.get('content-type') || 'application/zip');
    headers.set(
      'Content-Disposition',
      upstream.headers.get('content-disposition') || `attachment; filename="customer-${params.id}-documents.zip"`
    );
    headers.set('Cache-Control', 'no-store');
    headers.set('Content-Encoding', 'identity'); // doppelte Komprimierung vermeiden
    const len = upstream.headers.get('content-length');
    if (len) headers.set('Content-Length', len);

    // Stream bevorzugen; Fallback auf ArrayBuffer falls body fehlt
    if (upstream.body) {
      return new NextResponse(upstream.body, { status: upstream.status, headers });
    } else {
      const buf = await upstream.arrayBuffer();
      return new NextResponse(Buffer.from(buf), { status: upstream.status, headers });
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Proxy error', detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}











