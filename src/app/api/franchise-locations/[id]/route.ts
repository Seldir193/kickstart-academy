// src/app/api/franchise-locations/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getProviderIdFromCookies,
  getAdminTokenFromCookies,
} from "@/app/api/lib/auth";

function apiBase() {
  const b =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  const token = await getAdminTokenFromCookies();
  if (!pid || !token)
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );

  const body = await req.json().catch(() => ({}));
  const { id } = await ctx.params;
  const encId = encodeURIComponent(id);

  const r = await fetch(`${apiBase()}/franchise-locations/${encId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Provider-Id": pid,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  return PATCH(req, ctx);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  const token = await getAdminTokenFromCookies();
  if (!pid || !token)
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );

  const { id } = await ctx.params;
  const encId = encodeURIComponent(id);

  const r = await fetch(`${apiBase()}/franchise-locations/${encId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "X-Provider-Id": pid,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
