export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });
    }

    // Resend wird im Backend über ?resend=1 getriggert
    const r = await fetch(`${apiBase()}/bookings/${params.id}/confirm?resend=1`, {
      method: 'POST',
      headers: { 'X-Provider-Id': pid },
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }
    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Proxy failed', detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
