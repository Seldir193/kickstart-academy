// app/api/admin/bookings/[id]/confirm/route.ts
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

// POST /api/admin/bookings/:id/confirm[?resend=1] -> backend POST /bookings/:id/confirm
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status:401 });

  const resend = req.nextUrl.searchParams.get('resend') === '1';
  const qs = resend ? '?resend=1' : '';

  const r = await fetch(`${apiBase()}/bookings/${encodeURIComponent(params.id)}/confirm${qs}`, {
    method: 'POST',
    headers: { 'X-Provider-Id': pid, 'Accept': 'application/json' },
    cache: 'no-store',
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}













