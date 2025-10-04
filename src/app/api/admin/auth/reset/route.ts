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
    const token = clean(body?.token || '');
    const password = clean(body?.password || '');

    if (!token)   return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'Password too short' }, { status: 400 });
    }

    // Proxy an dein Backend
    const r = await fetch(`${apiBase()}/admin/auth/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (r.ok && (data?.ok ?? r.ok)) {
      return NextResponse.json({ ok: true, message: data?.message ?? 'Password updated' });
    }
    return NextResponse.json(data || { ok: false, error: 'Reset failed' }, { status: r.status || 500 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Reset route crashed', detail: String(e?.message ?? e) }, { status: 500 });
  }
}
