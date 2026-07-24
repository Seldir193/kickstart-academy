import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
export const runtime = "nodejs";

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return base.replace(/\/+$/, "");
}

function base64UrlToUtf8(payload: string) {
  const b64 =
    payload.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((payload.length + 3) % 4);

  const binary =
    typeof atob === "function"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("binary");

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return new TextDecoder().decode(bytes);
}

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(base64UrlToUtf8(parts[1])) as T;
  } catch {
    return null;
  }
}

async function getProviderIdFromCookies(): Promise<string | null> {
  const store = await cookies();

  const jwt = store.get("admin_token")?.value ?? null;
  if (jwt) {
    const p = decodeJwtPayload<any>(jwt) || {};
    const candidate =
      p.id ||
      p.sub ||
      p.providerId ||
      (p.user && (p.user.id || p.user._id)) ||
      null;
    if (candidate) return String(candidate);
  }

  const uid = store.get("admin_uid")?.value ?? null;
  return uid || null;
}

async function jsonPassthrough(r: Response) {
  const txt = await r.text();
  let data: unknown;
  try {
    data = JSON.parse(txt);
  } catch {
    data = { ok: false, raw: txt };
  }
  return NextResponse.json(data, { status: r.status });
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

  return jsonPassthrough(r);
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

  return jsonPassthrough(r);
}
