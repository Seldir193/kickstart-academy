export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

type JwtPayload = {
  email?: string;
  role?: string;
  sub?: string;
  id?: string;
  providerId?: string;
  isOwner?: boolean;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function json(body: any, status: number) {
  return NextResponse.json(body, { status });
}

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const b64 =
      payload.replace(/-/g, "+").replace(/_/g, "/") +
      "===".slice((payload.length + 3) % 4);

    const bin = Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(bin) as T;
  } catch {
    return null;
  }
}

function roleFrom(v: unknown) {
  const r = clean(v).toLowerCase();
  return r === "super" ? "super" : "provider";
}

async function fetchProfile(req: NextRequest, id: string) {
  const url = new URL(`/api/admin/auth/profile`, req.url);
  url.searchParams.set("id", id);

  const r = await fetch(url.toString(), {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") || "",
      accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await r.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!r.ok || !data?.ok) return null;

  const user = data?.user || {};
  const uid = clean(user.id || user._id);
  if (!uid) return null;

  return {
    id: uid,
    fullName: clean(user.fullName) || null,
    email: clean(user.email) || null,
    avatarUrl: clean(user.avatarUrl) || null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const jwt = clean(req.cookies.get("admin_token")?.value);
    if (!jwt) return json({ ok: false, error: "Unauthorized" }, 401);

    const payload = decodeJwtPayload<JwtPayload>(jwt);
    const id = clean(payload?.sub || payload?.id || payload?.providerId);

    const email = clean(payload?.email);
    if (!id) return json({ ok: false, error: "Unauthorized" }, 401);

    const role = roleFrom(payload?.role);
    const isSuperAdmin = role === "super";
    const isOwner = Boolean(payload?.isOwner === true);

    const profile = await fetchProfile(req, id);

    return NextResponse.json({
      ok: true,
      user: {
        id,
        fullName: profile?.fullName ?? null,
        email: profile?.email ?? email,
        avatarUrl: profile?.avatarUrl ?? null,
        role,
        isSuperAdmin,
        isOwner,
      },
    });
  } catch (e: any) {
    return json(
      { ok: false, error: "Server error", detail: clean(e?.message || e) },
      500,
    );
  }
}
