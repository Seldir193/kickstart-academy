















// app/api/admin/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Wichtig: Node-Laufzeit & keine statische Vor-Render-Optimierung
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function baseFromEnv() {
  // Fallback nutzt NEXT_PUBLIC_API_URL oder defaultet auf 127.0.0.1
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  return raw.replace(/\/$/, '');
}

function getProviderId(req: NextRequest): string | null {
  // 1) Header (falls der Client ihn mitsendet)
  const h = req.headers.get('x-provider-id');
  if (h && h.trim()) return h.trim();

  // 2) Cookies (vom Admin-Login)
  const c =
    req.cookies.get('providerId')?.value ||
    req.cookies.get('adminProviderId')?.value ||
    req.cookies.get('aid')?.value;
  if (c && String(c).trim()) return String(c).trim();

  // 3) Query (?providerId=...)
  const q = req.nextUrl.searchParams.get('providerId');
  if (q && q.trim()) return q.trim();

  return null;
}

export async function GET(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    // Extra-Log hilft dir beim Debuggen im Terminal
    console.error('[invoices-proxy] NEXT_BACKEND_API_BASE ist leer/undefiniert');
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: NEXT_BACKEND_API_BASE is missing' },
      { status: 500 }
    );
  }

  // Query 1:1 durchreichen
  const qs = req.nextUrl.searchParams.toString();
  const url = `${BASE}/admin/invoices${qs ? `?${qs}` : ''}`;

  // Provider-ID ermitteln (Header/Cookie/Query)
  const providerId = getProviderId(req);
  const headers: Record<string, string> = {};
  if (providerId) headers['x-provider-id'] = providerId;

  try {
    const r = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    // Body einfach durchreichen (Text reicht hier)
    const body = await r.text();
    return new NextResponse(body, {
      status: r.status,
      headers: {
        'content-type': r.headers.get('content-type') || 'application/json',
      },
    });
  } catch (e: any) {
    console.error('[invoices-proxy] fetch error:', e?.message || e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'Proxy error' },
      { status: 500 }
    );
  }
}








