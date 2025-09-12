

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

// GET /api/admin/customers/:id/documents?page=&limit=&type=&from=&to=&q=&sort=
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });
    }

    const qs = req.nextUrl.searchParams.toString();
    const url = `${apiBase()}/customers/${encodeURIComponent(params.id)}/documents${qs ? `?${qs}` : ''}`;

    const r = await fetch(url, {
      method: 'GET',
      headers: { 'x-provider-id': pid },
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














