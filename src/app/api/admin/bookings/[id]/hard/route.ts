// app/api/admin/bookings/[id]/hard/route.ts
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

// DELETE /api/admin/bookings/:id/hard
// -> backend DELETE /bookings/:id/hard
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const pid = await getProviderIdFromCookies();
  if (!pid)
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const qs = new URL(req.url).search;

  const r = await fetch(
    `${apiBase()}/bookings/${encodeURIComponent(params.id)}/hard${qs}`,
    {
      method: 'DELETE',
      headers: {
        'X-Provider-Id': pid,
      },
      cache: 'no-store',
    }
  );

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      'content-type': r.headers.get('content-type') || 'application/json',
    },
  });
}
