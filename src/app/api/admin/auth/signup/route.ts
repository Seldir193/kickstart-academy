import { NextResponse } from 'next/server';

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return base.replace(/\/+$/, '');
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const r = await fetch(`${apiBase()}/admin/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Proxy failed' }, { status: 500 });
  }
}













