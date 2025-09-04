






// app/api/admin/customers/[id]/documents.csv/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) return NextResponse.json({ ok:false, error:'Unauthorized: missing provider' }, { status:401 });

    const qs = req.nextUrl.searchParams.toString();
    const url = `${apiBase()}/customers/${encodeURIComponent(params.id)}/documents.csv${qs ? `?${qs}` : ''}`;
    const r = await fetch(url, { headers: { 'x-provider-id': pid }, cache: 'no-store' });

    const body = await r.text();
    return new NextResponse(body, {
      status: r.status,
      headers: {
        'Content-Type': r.headers.get('content-type') || 'text/csv; charset=utf-8',
        'Content-Disposition': r.headers.get('content-disposition') || `attachment; filename="documents.csv"`,
      },
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:'Proxy failed', detail:String(e?.message ?? e) }, { status:500 });
  }
}