

// app/api/admin/invoices/zip/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    '';
  return (raw || '').replace(/\/$/, '');
}

function getProviderId(req: NextRequest): string | null {
  const h = req.headers.get('x-provider-id');
  if (h && h.trim()) return h.trim();
  const c =
    req.cookies.get('providerId')?.value ||
    req.cookies.get('adminProviderId')?.value ||
    req.cookies.get('aid')?.value;
  if (c && String(c).trim()) return String(c).trim();
  const q = req.nextUrl.searchParams.get('providerId');
  if (q && q.trim()) return q.trim();
  return null;
}

export async function GET(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    console.error('[invoices-zip-proxy] NEXT_BACKEND_API_BASE missing');
    return NextResponse.json({ ok:false, error:'Server misconfigured: NEXT_BACKEND_API_BASE is missing' }, { status:500 });
  }

  const providerId = getProviderId(req);
  if (!providerId) {
    console.error('[invoices-zip-proxy] providerId fehlt (Header/Cookie/Query)');
    return NextResponse.json({ ok:false, error:'Missing provider id' }, { status:401 });
  }

  const qs = req.nextUrl.searchParams.toString();
  const url = `${BASE}/admin/invoices/zip${qs ? `?${qs}` : ''}`;
  console.log('[invoices-zip-proxy] →', url, 'pid=', providerId);

  try {
    const r = await fetch(url, {
      headers: { 'x-provider-id': providerId },
      cache: 'no-store',
    });

    const buf = await r.arrayBuffer();
    const headers: Record<string, string> = {
      'content-type': r.headers.get('content-type') || 'application/zip',
    };
    const cd = r.headers.get('content-disposition');
    if (cd) headers['content-disposition'] = cd;

    return new NextResponse(Buffer.from(buf), { status: r.status, headers });
  } catch (e: any) {
    console.error('[invoices-zip-proxy] error:', e?.message || e);
    return NextResponse.json({ ok:false, error: e?.message || 'Proxy error' }, { status:500 });
  }
}
















