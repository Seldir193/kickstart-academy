// app/api/admin/auth/login/route.ts
import { NextResponse } from 'next/server';
import { signAdminToken } from '@/app/api/lib/auth';

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
    const body = await req.json().catch(() => ({}));
    const e = clean(body?.email || '');
    const p = clean(body?.password || '');

    // providerId aus Body → Query → Cookie ziehen
    const providerId =
      clean(body?.providerId) ||
      clean(new URL(req.url).searchParams.get('providerId') || '') ||
      clean((req as any).cookies?.get?.('providerId')?.value || '');

    const envEmail = clean(process.env.ADMIN_EMAIL || '').toLowerCase();
    const envPass  = clean(process.env.ADMIN_PASSWORD || '');

    // --- ENV Admin (lokal signieren)
    if (envEmail && envPass && e.toLowerCase() === envEmail) {
      if (p !== envPass) {
        return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
      }
      if (!providerId) {
        return NextResponse.json({ ok:false, error:'providerId required' }, { status: 400 });
      }

      // WICHTIG: sub = providerId (Mongo ObjectId)
      const token = await signAdminToken({ id: providerId, email: envEmail, role: 'provider' });

      const res = NextResponse.json({
        ok: true,
        user: { id: providerId, fullName: 'System Admin', email: envEmail },
      });

      res.cookies.set('admin_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        secure: !isDev,
      });
      // zusätzlich Klartext-Cookie für einfache Weitergabe
      res.cookies.set('providerId', providerId, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        secure: !isDev,
      });
      return res;
    }

    // --- Backend Login (falls vorhanden)
    const r = await fetch(`${apiBase()}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e, password: p }),
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }

    if (r.ok && data?.ok && data?.user?.id && data?.user?.email) {
      const token = await signAdminToken({ id: data.user.id, email: data.user.email, role: 'provider' });
      const res = NextResponse.json({ ok: true, user: data.user }, { status: 200 });
      res.cookies.set('admin_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        secure: !isDev,
      });
      // providerId aus Backend übernehmen (falls nötig)
      res.cookies.set('providerId', data.user.id, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        secure: !isDev,
      });
      return res;
    }

    return NextResponse.json(data, { status: r.status || 500 });
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json({ ok: false, error: 'Login route crashed', detail: String(e?.message ?? e) }, { status: 500 });
  }
}















