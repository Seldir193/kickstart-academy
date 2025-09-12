

import { NextRequest, NextResponse } from 'next/server';

const BASE = (process.env.NEXT_BACKEND_API_BASE || '').replace(/\/$/, '');

function getProviderId(req: NextRequest): string | null {
  const h = req.headers.get('x-provider-id');
  if (h) return h.trim();
  const c =
    req.cookies.get('providerId')?.value ||
    req.cookies.get('adminProviderId')?.value ||
    req.cookies.get('aid')?.value;
  if (c) return String(c).trim();
  const q = req.nextUrl.searchParams.get('providerId');
  return q ? q.trim() : null;
}

export async function GET(req: NextRequest) {
  try {
    if (!BASE) {
      return NextResponse.json({ ok:false, error:'NEXT_BACKEND_API_BASE missing' }, { status: 500 });
    }

    const providerId = getProviderId(req);
    if (!providerId) {
      return NextResponse.json({ ok:false, error:'Missing provider id' }, { status: 401 });
    }

    const qs = req.nextUrl.searchParams.toString();
    const url = `${BASE}/admin/invoices/csv${qs ? `?${qs}` : ''}`;

    const r = await fetch(url, {
      headers: { 'x-provider-id': providerId },
      cache: 'no-store',
    });

    // Body als ArrayBuffer durchreichen (CSV)
    const body = await r.arrayBuffer();
    const headers = new Headers(r.headers);

    // Setze sichere Defaults, falls Backend nix setzt
    if (!headers.get('content-type')) {
      headers.set('content-type', 'text/csv; charset=utf-8');
    }
    if (!headers.get('content-disposition')) {
      headers.set('content-disposition', 'attachment; filename="invoices.csv"');
    }

    return new NextResponse(body, { status: r.status, headers });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message || 'Proxy error' }, { status: 500 });
  }
}


















