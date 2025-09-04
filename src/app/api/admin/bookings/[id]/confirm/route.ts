// app/api/admin/bookings/[id]/confirm/route.ts

// Lauf sicher in Node (Buffer verfügbar) & ohne Cache
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

/** Backend-API-Basis sauber normalisieren */
function apiBase(): string {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

/** POST /api/admin/bookings/:id/confirm[?resend=1]
 *  Proxyt zum Backend: POST /api/bookings/:id/confirm
 *  - Auth/Scope via X-Provider-Id Header
 *  - unterstützt ?resend=1 durchreichen
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Provider-ID aus JWT-Cookie
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized: missing provider' },
        { status: 401 }
      );
    }

    // optionales ?resend=1 aus der Frontend-URL übernehmen
    const resend = req.nextUrl.searchParams.get('resend') === '1';
    const qs = resend ? '?resend=1' : '';

    // Auf Backend routen
    const url = `${apiBase()}/bookings/${encodeURIComponent(params.id)}/confirm${qs}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Provider-Id': pid,        // WICHTIG: Owner-Scope
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });

    // Robust JSON parsen (falls Backend plain text liefert)
    const raw = await r.text();
    let data: any;
    try { data = JSON.parse(raw); } catch { data = { ok: false, raw }; }

    return NextResponse.json(data, { status: r.status });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: 'Proxy failed', detail: msg },
      { status: 500 }
    );
  }
}
