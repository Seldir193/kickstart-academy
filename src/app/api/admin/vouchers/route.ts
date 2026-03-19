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

function filterItems(items: any[], q: string, status: string) {
  let list = Array.isArray(items) ? items : [];
  const needle = String(q || "")
    .trim()
    .toLowerCase();

  if (needle) {
    list = list.filter((item) =>
      String(item?.code || "")
        .toLowerCase()
        .includes(needle),
    );
  }

  if (status === "active") {
    list = list.filter((item) => item?.active === true);
  }

  if (status === "inactive") {
    list = list.filter((item) => item?.active === false);
  }

  return list;
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const status = (
      req.nextUrl.searchParams.get("status") || "all"
    ).toLowerCase();

    const r = await fetch(`${apiBase()}/vouchers`, {
      method: "GET",
      headers: await buildHeaders(req),
      cache: "no-store",
    });

    const text = await r.text();
    const data = safeJson(text);

    if (!r.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.error || `Upstream vouchers failed (${r.status})`,
          detail: data,
        },
        { status: r.status },
      );
    }

    const items = Array.isArray(data?.vouchers) ? data.vouchers : [];
    const vouchers = filterItems(items, q, status);

    return NextResponse.json({ ok: true, vouchers }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/admin/vouchers] error:", err?.message || err);
    return NextResponse.json(
      {
        ok: false,
        error: "Server error in /api/admin/vouchers",
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log("[POST /api/admin/vouchers] body", body);

    const r = await fetch(`${apiBase()}/vouchers`, {
      method: "POST",
      headers: await buildHeaders(req, true),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await r.text();
    const data = safeJson(text);

    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    console.error("[POST /api/admin/vouchers] error:", err?.message || err);
    return NextResponse.json(
      {
        ok: false,
        error: "Server error in POST /api/admin/vouchers",
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}
