// app/api/admin/auth/signup/route.ts
import { NextResponse } from 'next/server';

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return base.replace(/\/+$/, '');
}

export async function POST(req: Request) {
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 10_000); // 10s Timeout

  try {
    const payload = await req.json().catch(() => ({}));

    const r = await fetch(`${apiBase()}/admin/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: ctl.signal,
    });

    const text = await r.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }

    // Antwort 1:1 weitergeben
    const res = new NextResponse(JSON.stringify(data), {
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });

    // ✅ Bei Erfolg: Identität per HttpOnly-Cookies bereitstellen
    // (Profile-Proxy liest erst admin_uid, dann admin_token; damit klappt's sofort auch ohne extra Login)
    if (r.ok && (data?.ok === true || data?.user)) {
      const uid = data?.user?.id ? String(data.user.id) : null;
      const eml = data?.user?.email ? String(data.user.email) : null;

      const opts = {
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 Tage
      };

      if (uid) res.cookies.set('admin_uid', uid, opts);
      if (eml) res.cookies.set('admin_email', eml, opts);
      // Hinweis: Dein Login setzt zusätzlich admin_token (JWT).
      // Für den Profil-Proxy reicht hier admin_uid bereits (Fallback).
    }

    return res;
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'Upstream timeout' : (e?.message || 'Proxy failed');
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  } finally {
    clearTimeout(to);
  }
}







