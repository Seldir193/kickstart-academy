























import { NextResponse } from 'next/server';

function clean(v: unknown) {
  return String(v ?? '').trim().replace(/^['"]|['"]$/g, '');
}

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return base.replace(/\/+$/, '');
}

export async function POST(req: Request) {
  const isDev = process.env.NODE_ENV !== 'production';

  try {
    const { email = '', password = '' } = await req.json().catch(() => ({}));
    const e = clean(email).toLowerCase();
    const p = clean(password);

    const envEmail = clean(process.env.ADMIN_EMAIL || '').toLowerCase();
    const envPass  = clean(process.env.ADMIN_PASSWORD || '');

    // 1) ENV-Admin zuerst prüfen
    if (envEmail && envPass && e === envEmail) {
      if (p === envPass) {
        const res = NextResponse.json({
          ok: true,
          user: { id: 'env-admin', fullName: 'System Admin', email: envEmail },
        });
        res.cookies.set('admin_token', 'env', {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          secure: !isDev,
        });
        return res;
      }
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // 2) Sonst: an Backend-Login weiterleiten (DB-User)
    const r = await fetch(`${apiBase()}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e, password: p }),
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }

    if (r.ok && data?.ok) {
      const res = NextResponse.json(data, { status: 200 });
      res.cookies.set('admin_token', 'db', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        secure: !isDev,
      });
      return res;
    }

    // Fehler vom Backend 1:1 zurückgeben (z.B. 401)
    return NextResponse.json(data, { status: r.status || 500 });
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json(
      { ok: false, error: 'Login route crashed', detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
