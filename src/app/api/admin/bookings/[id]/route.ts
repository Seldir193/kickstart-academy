// app/api/admin/bookings/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

function apiBase() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return raw.replace(/\/+$/, "");
}

type Ctx = { params: Promise<{ id: string }> };

// Optional: GET /api/admin/bookings/:id -> backend /bookings/:id
export async function GET(_req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await ctx.params;

  const r = await fetch(`${apiBase()}/bookings/${encodeURIComponent(id)}`, {
    headers: { "X-Provider-Id": pid, Accept: "application/json" },
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

// DELETE /api/admin/bookings/:id -> backend DELETE /bookings/:id
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await ctx.params;

  const r = await fetch(`${apiBase()}/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "X-Provider-Id": pid },
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
