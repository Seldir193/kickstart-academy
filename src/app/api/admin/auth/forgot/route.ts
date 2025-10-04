// app/api/admin/auth/forgot/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


function clean(v: unknown) {
  return String(v ?? '').trim().replace(/^['"]|['"]$/g, '');
}
function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return base.replace(/\/+$/, '');
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = clean(body?.email || '').toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    const r = await fetch(`${apiBase()}/admin/auth/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (r.ok && (data?.ok ?? r.ok)) {
      return NextResponse.json({ ok: true, message: data?.message ?? 'Reset email sent' });
    }
    return NextResponse.json(data || { ok: false, error: 'Forgot request failed' }, { status: r.status || 500 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Forgot route crashed', detail: String(e?.message ?? e) }, { status: 500 });
  }
}

// friendly responses for accidental methods
export async function GET() {
  return NextResponse.json({ ok: false, error: 'Use POST' }, {
    status: 405,
    headers: { Allow: 'POST, OPTIONS' },
  });
}
export async function HEAD() {
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST, OPTIONS' } });
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
