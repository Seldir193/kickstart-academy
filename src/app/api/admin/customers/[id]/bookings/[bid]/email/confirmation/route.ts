export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

type Ctx = { params: Promise<{ id: string; bid: string }> };

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, raw: text };
  }
}

// POST /api/admin/customers/:id/bookings/:bid/email/confirmation[?force=1]
export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: missing provider" },
        { status: 401 }
      );
    }

    const { id, bid } = await ctx.params;

    const body = await req.json().catch(() => ({}));
    const qs = req.nextUrl.searchParams.toString();
    const url =
      `${apiBase()}/customers/${encodeURIComponent(id)}` +
      `/bookings/${encodeURIComponent(bid)}/email/confirmation` +
      (qs ? `?${qs}` : "");

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-provider-id": pid,
      },
      cache: "no-store",
      body: JSON.stringify(body),
    });

    const text = await r.text();
    const data = safeJsonParse(text);
    return NextResponse.json(data, { status: r.status });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: "Proxy failed", detail: msg },
      { status: 500 }
    );
  }
}
