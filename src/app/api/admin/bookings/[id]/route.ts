export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

// optional: Booking-Detail
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });

  const r = await fetch(`${apiBase()}/bookings/${params.id}`, {
    headers: { 'X-Provider-Id': pid },
    cache: 'no-store',
  });

  const text = await r.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { ok:false, raw:text }; }
  return NextResponse.json(data, { status: r.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });

  const r = await fetch(`${apiBase()}/bookings/${params.id}`, {
    method: 'DELETE',
    headers: { 'X-Provider-Id': pid },   // << wichtig, kein Basic!
    cache: 'no-store',
  });

  const text = await r.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { ok:false, raw:text }; }
  return NextResponse.json(data, { status: r.status });
}
