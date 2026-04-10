//src\app\api\admin\auth\users\[id]\active\route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getProviderId } from "@/app/api/lib/auth";

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

type Ctx = { params: Promise<{ id?: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const BASE = apiBase();

  const providerId = await getProviderId(req);
  if (!providerId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
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
  const hasActive = typeof body?.active === "boolean";
  if (!hasActive) {
    return NextResponse.json(
      { ok: false, error: "Missing active boolean" },
      { status: 400 },
    );
  }

  const target = `${BASE}/admin/auth/users/${encodeURIComponent(userId)}/active`;

  const r = await fetch(target, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      cookie: req.headers.get("cookie") || "",
      accept: "application/json",
      "x-provider-id": providerId,
    },
    body: JSON.stringify({ active: body.active }),
    cache: "no-store",
  });

  const text = await r.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { ok: false, raw: text };
  }

  return NextResponse.json(data, { status: r.status });
}
