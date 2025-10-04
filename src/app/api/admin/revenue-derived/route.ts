// app/api/admin/revenue-derived/route.ts
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return base.replace(/\/+$/, '');
}
function getSearch(req: Request) {
  return new URL(req.url).search || '';
}
function assertEnv(name: string) {
  const v = (process.env[name] || '').trim();
  if (!v) throw new Error(`${name} is missing`);
  return v;
}

async function resolveProviderId(req: Request): Promise<string | null> {
  try {
    const store = await cookies();   // <-- async!
    const hdrs  = await headers();   // <-- async!
    const url   = new URL(req.url);

    // 1) JWT
    const token = store.get('admin_token')?.value;
    if (token) {
      try {
        const secret = assertEnv('AUTH_SECRET');
        const payload = jwt.verify(token, secret) as any;
        const pid = String(payload?.id || payload?.providerId || '').trim();
        if (pid) return pid;
      } catch { /* ignore */ }
    }

    // 2) Fallback-Cookies
    const pidCookie =
      store.get('admin_uid')?.value ||
      store.get('providerId')?.value;
    if (pidCookie && String(pidCookie).trim()) return String(pidCookie).trim();

    // 3) Header
    const pidHeader = hdrs.get('x-provider-id');
    if (pidHeader && pidHeader.trim()) return pidHeader.trim();

    // 4) Query
    const pidQuery = url.searchParams.get('providerId');
    if (pidQuery && pidQuery.trim()) return pidQuery.trim();

    return null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const providerId = await resolveProviderId(req);
    if (!providerId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const upstream = `${apiBase()}/admin/revenue-derived${getSearch(req)}`;
    const r = await fetch(upstream, {
      headers: { 'x-provider-id': providerId },
      cache: 'no-store',
    });

    const text = await r.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: r.status });
    } catch {
      return new NextResponse(text, {
        status: r.status,
        headers: { 'Content-Type': r.headers.get('Content-Type') || 'text/plain' },
      });
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Revenue-derived proxy failed', detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
