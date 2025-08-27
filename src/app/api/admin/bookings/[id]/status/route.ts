export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Provider-ID aus dem JWT-Cookie lesen
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    // ?force=1 etc. durchreichen
    const qs = new URL(req.url).search;

    const r = await fetch(`${apiBase()}/bookings/${params.id}/status${qs}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Provider-Id': pid,  // << wichtig
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }
    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Proxy failed', detail: String(e?.message ?? e) }, { status: 500 });
  }
}











