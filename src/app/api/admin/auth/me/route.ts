// app/api/admin/auth/me/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';

/** minimal JWT base64url decode (ohne verify; reicht hier für E-Mail-Auslesen) */
function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      + '==='.slice((payload.length + 3) % 4);
    const bin = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(bin) as T;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    // 1) E-Mail aus JWT lesen (bevorzugt)
    const jwt = req.cookies.get('admin_token')?.value || '';
    const payload = jwt ? decodeJwtPayload<{ email?: string }>(jwt) : null;
    const emailFromJwt = (payload?.email || '').trim();

    // 2) Fallbacks: Cookies
    const emailCookie =
      req.cookies.get('admin_email')?.value ||
      req.cookies.get('email')?.value || '';

    const email = (emailFromJwt || emailCookie).trim();

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 3) Dein eigener Profile-Proxy liefert fullName zurück
    const url = new URL(`/api/admin/auth/profile`, req.url);
    url.searchParams.set('email', email);

    const r = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        // Cookie-Header durchreichen, damit /profile ggf. providerId aus Cookies/JWT ziehen kann
        cookie: req.headers.get('cookie') || '',
        accept: 'application/json',
      },
      cache: 'no-store',
    });

    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { ok:false, raw:text }; }

    if (!r.ok) {
      // Fallback: gib wenigstens die E-Mail zurück
      return NextResponse.json({
        ok: true,
        user: { id: null, fullName: null, email, avatarUrl: null },
      }, { status: 200 });
    }

    const user = data?.user || {};
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id || user._id || null,
        fullName: user.fullName || null,
        email: user.email || email,
        avatarUrl: user.avatarUrl || null,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Server error', detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}


