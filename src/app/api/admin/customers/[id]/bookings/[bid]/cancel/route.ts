
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

// POST /api/admin/customers/:id/bookings/:bid/cancel[?silent=1&force=1]
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; bid: string } }
) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized: missing provider' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const qs = req.nextUrl.searchParams.toString();
    const url =
      `${apiBase()}/customers/${encodeURIComponent(params.id)}` +
      `/bookings/${encodeURIComponent(params.bid)}/cancel` +
      (qs ? `?${qs}` : '');

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-provider-id': pid,
      } as any,
      cache: 'no-store',
      body: JSON.stringify(body),
    });

    const text = await r.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }

    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Proxy failed', detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
