// app/api/admin/auth/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
export const runtime = 'nodejs';

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return base.replace(/\/+$/, "");
}


function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url → base64 + padding
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      + '==='.slice((payload.length + 3) % 4);

    // Browser/Edge: atob vorhanden
    const binary = typeof atob === 'function'
      ? atob(b64)
      : Buffer.from(b64, 'base64').toString('binary'); // Node Fallback

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}




async function getProviderIdFromCookies(): Promise<string | null> {
  const store = await cookies();

  // 1) Bevorzugt: JWT
  const jwt = store.get('admin_token')?.value ?? null;
  if (jwt) {
    const p = decodeJwtPayload<any>(jwt) || {};
    const candidate = p.id || p.sub || p.providerId || (p.user && (p.user.id || p.user._id)) || null;
    if (candidate) return String(candidate);
  }

  // 2) Fallback: altes Cookie
  const uid = store.get('admin_uid')?.value ?? null;
  return uid || null;
}



export async function GET(req: NextRequest) {
  const target = new URL(`${apiBase()}/admin/auth/profile`);
  const q = req.nextUrl.searchParams;
  const id = q.get("id");
  const email = q.get("email");
  if (id) target.searchParams.set("id", id);
  if (email) target.searchParams.set("email", email);

  const providerId = await getProviderIdFromCookies();

  const r = await fetch(target, {
    headers: {
      cookie: req.headers.get("cookie") || "",
      ...(providerId ? { "x-provider-id": providerId } : {}),
    },
    cache: "no-store",
  });

  const txt = await r.text();
  let data: any; try { data = JSON.parse(txt); } catch { data = { ok:false, raw:txt }; }
  return NextResponse.json(data, { status: r.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const providerId = await getProviderIdFromCookies();

  const r = await fetch(`${apiBase()}/admin/auth/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.get("cookie") || "",
      ...(providerId ? { "x-provider-id": providerId } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const txt = await r.text();
  let data: any; try { data = JSON.parse(txt); } catch { data = { ok:false, raw:txt }; }
  return NextResponse.json(data, { status: r.status });
}
