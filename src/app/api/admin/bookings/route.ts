// Lauf sicher im Node.js-Runtime (damit Buffer verfügbar ist)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

export async function GET(req: NextRequest) {
  try {
    // Provider-ID aus JWT-Cookie holen
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });
    }

    // Query durchreichen (?status=..., ?page=..., ...)
    const url = new URL(`${apiBase()}/bookings`);
    req.nextUrl.searchParams.forEach((v, k) => url.searchParams.append(k, v));

    // WICHTIG: X-Provider-Id statt Basic!
    const r = await fetch(url.toString(), {
      headers: { 'X-Provider-Id': pid },
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }
    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    console.error('admin bookings proxy error:', e);
    return NextResponse.json({ ok: false, error: 'Proxy failed', detail: String(e?.message ?? e) }, { status: 500 });
  }
}









