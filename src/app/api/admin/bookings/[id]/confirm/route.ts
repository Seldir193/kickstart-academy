// Lauf sicher in Node (Buffer verfügbar) & ohne Cache
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Provider-ID aus dem JWT-Cookie holen
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });
    }

    // An Backend weiterleiten – WICHTIG: X-Provider-Id statt Basic!
    const r = await fetch(`${apiBase()}/bookings/${params.id}/confirm`, {
      method: 'POST',
      headers: { 'X-Provider-Id': pid },
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }
    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Proxy failed', detail: String(e?.message ?? e) }, { status: 500 });
  }
}



