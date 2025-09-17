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

    // Guard: AUTH_SECRET muss vorhanden sein (sonst crasht die Signierung tiefer)
    const authSecret = (process.env.AUTH_SECRET || '').trim();
    if (!authSecret) {
      return NextResponse.json(
        { ok: false, error: 'Server misconfigured: AUTH_SECRET is missing' },
        { status: 500 }
      );
    }

    // providerId aus Body → Query → (Alt-)Cookie
    const providerId =
      clean(body?.providerId) ||
      clean(new URL(req.url).searchParams.get('providerId') || '') ||
      clean((req as any).cookies?.get?.('providerId')?.value || '');

    const envEmail = clean(process.env.ADMIN_EMAIL || '').toLowerCase();
    const envPass  = clean(process.env.ADMIN_PASSWORD || '');

    // === ENV Admin-Login (lokal signieren, ohne Backend) ===
    if (envEmail && envPass && e.toLowerCase() === envEmail) {
      if (p !== envPass) {
        return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
      }
      if (!providerId) {
        return NextResponse.json({ ok: false, error: 'providerId required' }, { status: 400 });
      }

      let token = '';
      try {
        token = await signAdminToken({ id: providerId, email: envEmail, role: 'provider' });
      } catch (err: any) {
        return NextResponse.json(
          { ok: false, error: 'Token signing failed', detail: String(err?.message ?? err) },
          { status: 500 }
        );
      }

      const res = NextResponse.json({
        ok: true,
        user: { id: providerId, fullName: 'System Admin', email: envEmail },
      });

      // Nur HttpOnly JWT setzen (Single Source of Truth)
      res.cookies.set('admin_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 Tage
        secure: !isDev,
      });

      return res;
    }

    // === Backend-Login (Proxy) ===
    const r = await fetch(`${apiBase()}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e, password: p }),
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }

    // Flexibles Mapping: id | _id | providerId
    const user = data?.user ?? {};
    const userId = user?.id || user?._id || user?.providerId;
    const userEmail = user?.email;

    if (r.ok && (data?.ok ?? r.ok) && userId && userEmail) {
      let token = '';
      try {
        token = await signAdminToken({ id: String(userId), email: String(userEmail), role: 'provider' });
      } catch (err: any) {
        return NextResponse.json(
          { ok: false, error: 'Token signing failed', detail: String(err?.message ?? err) },
          { status: 500 }
        );
      }

      const res = NextResponse.json(
        { ok: true, user: { ...user, id: String(userId) } },
        { status: 200 }
      );

      // Nur HttpOnly JWT setzen (kein Klartext-Provider-Cookie)
      res.cookies.set('admin_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        secure: !isDev,
      });

      return res;
    }

    // Upstream-Fehler 1:1 durchreichen (sichtbar debuggen)
    return NextResponse.json(
      data || { ok: false, error: 'Login failed' },
      { status: r.status || 500 }
    );
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json(
      { ok: false, error: 'Login route crashed', detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}



