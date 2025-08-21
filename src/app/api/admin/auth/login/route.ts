import { NextResponse } from 'next/server';

function clean(v: unknown) {
  return String(v ?? '').trim().replace(/^['"]|['"]$/g, ''); // entfernt evtl. Anführungszeichen
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json().catch(() => ({}));

    const envEmailRaw = process.env.ADMIN_EMAIL;
    const envPassRaw  = process.env.ADMIN_PASSWORD;

    // in DEV notfalls mit Default arbeiten, damit kein 500 kommt
    const isDev = process.env.NODE_ENV !== 'production';
    const envEmail = clean(envEmailRaw || (isDev ? 'admin@example.com' : ''));
    const envPass  = clean(envPassRaw  || (isDev ? 'supergeheim'     : ''));

    if (!envEmail || !envPass) {
      return NextResponse.json(
        { ok: false, error: 'Admin credentials missing', meta: { haveEmail: !!envEmailRaw, havePass: !!envPassRaw } },
        { status: 500 }
      );
    }

    if (email === envEmail && password === envPass) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set('admin_token', '1', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        // secure: true // erst im Prod-Deployment mit HTTPS aktivieren
      });
      return res;
    }

    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json(
      { ok: false, error: 'Login route crashed', detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
