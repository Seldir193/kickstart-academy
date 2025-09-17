// app/api/admin/invoices/zip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProviderId } from '@/app/api/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  return raw.replace(/\/$/, '');
}

export async function GET(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: NEXT_BACKEND_API_BASE is missing' },
      { status: 500 }
    );
  }

  // 🔐 Nur aus HttpOnly-JWT (kein Header/Query/Klartext-Cookie vom Client)
  const providerId = await getProviderId(req);
  if (!providerId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Query 1:1 weiterreichen
  const qs = req.nextUrl.searchParams.toString();
  const url = `${BASE}/admin/invoices/zip${qs ? `?${qs}` : ''}`;

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/zip,application/octet-stream,application/json',
        'x-provider-id': providerId,
      },
      cache: 'no-store',
    });

    // Stream direkt durchreichen; Header übernehmen/fallbacken
    const res = new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/zip',
        'content-disposition':
          upstream.headers.get('content-disposition') || 'attachment; filename="invoices.zip"',
      },
    });

    const len = upstream.headers.get('content-length');
    if (len) res.headers.set('content-length', len);

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Proxy error' },
      { status: 500 }
    );
  }
}









