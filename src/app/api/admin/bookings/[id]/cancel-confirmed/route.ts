// app/api/admin/bookings/[id]/cancel-confirmed/route.ts
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

// POST /api/admin/bookings/:id/cancel-confirmed
// -> backend POST /bookings/:id/cancel-confirmed
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const r = await fetch(`${apiBase()}/bookings/${encodeURIComponent(params.id)}/cancel-confirmed`, {
    method: 'POST',
    headers: { 'X-Provider-Id': pid, Accept: 'application/json' },
    cache: 'no-store',
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}
