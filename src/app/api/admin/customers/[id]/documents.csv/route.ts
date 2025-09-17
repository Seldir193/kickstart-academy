


// app/api/admin/customers/[id]/documents.csv/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });
    }

    const qs = req.nextUrl.searchParams.toString();
    const url = `${apiBase()}/customers/${encodeURIComponent(params.id)}/documents.csv${qs ? `?${qs}` : ''}`;

    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Provider-Id': pid,
        'Accept': 'text/csv',
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
    headers.set('Content-Type', upstream.headers.get('content-type') || 'text/csv; charset=utf-8');
    headers.set(
      'Content-Disposition',
      upstream.headers.get('content-disposition') || `attachment; filename="documents.csv"`
    );
    headers.set('Cache-Control', 'no-store');
    headers.set('Content-Encoding', 'identity'); // keine doppelte Komprimierung
    const len = upstream.headers.get('content-length');
    if (len) headers.set('Content-Length', len);

    // Stream bevorzugen; Fallback falls kein body verfügbar
    if (upstream.body) {
      return new NextResponse(upstream.body, { status: upstream.status, headers });
    } else {
      const buf = await upstream.arrayBuffer();
      return new NextResponse(Buffer.from(buf), { status: upstream.status, headers });
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Proxy failed', detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}













