// src/app/api/admin/auth/users/[id]/role/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/app/api/lib/auth";

function apiBase() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return raw.replace(/\/+$/, "");
}

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function normRole(v: unknown) {
  const r = clean(v).toLowerCase();
  return r === "super" || r === "provider" ? r : "";
}

type Ctx = { params: Promise<{ id?: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { ok: false, error: guard.error },
      { status: guard.status },
    );
  }

  if (guard.claims?.isOwner !== true) {
    return NextResponse.json(
      { ok: false, error: "Only owner can change roles." },
      { status: 403 },
    );
  }

  const { id } = await ctx.params;
  const userId = clean(id);
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Missing id" },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const role = normRole(body?.role);
  if (!role) {
    return NextResponse.json(
      { ok: false, error: "Invalid role" },
      { status: 400 },
    );
  }

  const target = `${apiBase()}/admin/auth/users/${encodeURIComponent(
    userId,
  )}/role`;

  const r = await fetch(target, {
    method: "PATCH",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      cookie: req.headers.get("cookie") || "",
      "x-provider-id": guard.claims.id,
    },
    body: JSON.stringify({ role }),
    cache: "no-store",
  });

  const text = await r.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { ok: r.ok, raw: text };
  }

  return NextResponse.json(data, { status: r.status });
}
