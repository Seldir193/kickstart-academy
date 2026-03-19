export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return base.replace(/\/+$/, "");
}

function safeJson(text: string) {
  try {
    return JSON.parse(text || "{}");
  } catch {
    return { raw: text };
  }
}

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const b64 =
      payload.replace(/-/g, "+").replace(/_/g, "/") +
      "===".slice((payload.length + 3) % 4);

    const binary =
      typeof atob === "function"
        ? atob(b64)
        : Buffer.from(b64, "base64").toString("binary");

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

  return store.get("admin_uid")?.value ?? null;
}

async function buildHeaders(req: NextRequest, withJson = false) {
  const providerId = await getProviderIdFromCookies();
  const headers = new Headers();

  headers.set("accept", "application/json");
  headers.set("cookie", req.headers.get("cookie") ?? "");

  if (providerId) headers.set("x-provider-id", providerId);
  if (withJson) headers.set("content-type", "application/json");

  return headers;
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Params) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const r = await fetch(`${apiBase()}/vouchers/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: await buildHeaders(req, true),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await r.text();
    const data = safeJson(text);

    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    console.error(
      "[PATCH /api/admin/vouchers/[id]] error:",
      err?.message || err,
    );
    return NextResponse.json(
      {
        ok: false,
        error: "Server error in PATCH /api/admin/vouchers/[id]",
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, ctx: Params) {
  try {
    const { id } = await ctx.params;

    const r = await fetch(`${apiBase()}/vouchers/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: await buildHeaders(req),
      cache: "no-store",
    });

    const text = await r.text();
    const data = safeJson(text);

    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    console.error(
      "[DELETE /api/admin/vouchers/[id]] error:",
      err?.message || err,
    );
    return NextResponse.json(
      {
        ok: false,
        error: "Server error in DELETE /api/admin/vouchers/[id]",
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}
