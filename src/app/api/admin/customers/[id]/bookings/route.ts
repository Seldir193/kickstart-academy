
import { NextResponse } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const r = await fetch(`${apiBase()}/customers/${encodeURIComponent(params.id)}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Provider-Id': pid },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await r.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return NextResponse.json(data, { status: r.status });
}
