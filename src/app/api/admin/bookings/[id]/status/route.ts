// app/api/admin/bookings/[id]/status/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  return raw.replace(/\/+$/, '');
}

// PATCH /api/admin/bookings/:id/status -> backend PATCH /bookings/:id/status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status:401 });

  const body = await req.json().catch(() => ({}));
  const qs = new URL(req.url).search; // ?force=1 etc. weiterreichen

  const r = await fetch(`${apiBase()}/bookings/${encodeURIComponent(params.id)}/status${qs}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-Provider-Id': pid },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}













