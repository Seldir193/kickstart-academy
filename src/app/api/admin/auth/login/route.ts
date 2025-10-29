


// app/api/admin/auth/login/route.ts
import { NextResponse } from 'next/server';
import { signAdminToken } from '@/app/api/lib/auth';

const clean = (v: unknown) => String(v ?? '').trim();
const apiBase = () =>
  (process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api').replace(/\/+$/, '');

export async function POST(req: Request) {
  const isDev = process.env.NODE_ENV !== 'production';
  const body = await req.json().catch(() => ({}));
  const email = clean(body?.email).toLowerCase();
  const password = clean(body?.password);

  // -------- ENV-Admin-Login --------
  const envEmail = clean(process.env.ADMIN_EMAIL).toLowerCase();
  const envPass  = clean(process.env.ADMIN_PASSWORD);
  if (envEmail && envPass && email === envEmail) {
    if (password !== envPass) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // providerId MUSS ein gültiger ObjectId-String sein (Owner-ID)
    const providerId =
      clean(body?.providerId) ||
      clean(new URL(req.url).searchParams.get('providerId')) ||
      clean((req as any).cookies?.get?.('providerId')?.value || '');

    if (!/^[a-f0-9]{24}$/i.test(providerId)) {
      return NextResponse.json(
        { ok: false, error: 'providerId (24-hex) required for ENV admin' },
        { status: 400 }
      );
    }

    const token = await signAdminToken({
      id: providerId,          // <- wichtig: als id setzen
                 // <- zusätzlich explizit
      email: envEmail,
      role: 'provider',
    });

    const res = NextResponse.json({
      ok: true,
      user: { id: providerId, email: envEmail },
    });

    res.cookies.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: !isDev,
    });

    return res;
  }

  // -------- Backend-Login (Proxy) --------
  const r = await fetch(`${apiBase()}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  const text = await r.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }

  const user = data?.user ?? {};
  const userId = user?.id || user?._id || user?.providerId;
  const userEmail = user?.email;

  if (r.ok && userId && userEmail) {
    // Hier signieren wir weiterhin mit userId – dein Proxy akzeptiert das (siehe Route unten)
    const token = await signAdminToken({
      id: String(userId),
      email: String(userEmail),
      role: 'provider',
    });

    const res = NextResponse.json({ ok: true, user: { ...user, id: String(userId) } });
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: !isDev,
    });
    return res;
  }

  return NextResponse.json(data || { ok: false, error: 'Login failed' }, { status: r.status || 500 });
}











