import { NextRequest, NextResponse } from "next/server";
import { getProviderId } from "@/app/api/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return raw.replace(/\/+$/, "");
}

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const BASE = baseFromEnv();
    const { id } = await ctx.params;
    const bookingId = String(id || "").trim();
    if (!bookingId) return jsonError(400, "Missing booking id");

    const providerId = await getProviderId(req);
    if (!providerId) return jsonError(401, "Unauthorized");

    const bodyText = await req.text();
    const url = `${BASE}/bookings/${encodeURIComponent(bookingId)}/refund`;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": req.headers.get("content-type") || "application/json",
        accept: "application/json",
        "x-provider-id": providerId,
      },
      body: bodyText,
      cache: "no-store",
    });

    const out = await r.text();

    return new NextResponse(out, {
      status: r.status,
      headers: {
        "content-type": r.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    return jsonError(500, e?.message || "Proxy error");
  }
}
