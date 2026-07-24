import { NextResponse, type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

export type BookingActionCtx = {
  params: Promise<{ id: string; bid: string }>;
};

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, raw: text };
  }
}

function buildActionUrl(
  id: string,
  bid: string,
  actionPath: string,
  qs: string,
) {
  return (
    `${apiBase()}/customers/${encodeURIComponent(id)}` +
    `/bookings/${encodeURIComponent(bid)}${actionPath}` +
    (qs ? `?${qs}` : "")
  );
}

function unauthorizedProviderResponse() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized: missing provider" },
    { status: 401 },
  );
}

function proxyFailedResponse(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return NextResponse.json(
    { ok: false, error: "Proxy failed", detail: msg },
    { status: 500 },
  );
}

export async function postBookingAction(
  req: NextRequest,
  ctx: BookingActionCtx,
  actionPath: string,
  options: { includeQuery: boolean },
) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) return unauthorizedProviderResponse();

    const { id, bid } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const qs = options.includeQuery ? req.nextUrl.searchParams.toString() : "";

    const r = await fetch(buildActionUrl(id, bid, actionPath, qs), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-provider-id": pid,
      },
      cache: "no-store",
      body: JSON.stringify(body),
    });

    const text = await r.text();
    return NextResponse.json(safeJsonParse(text), { status: r.status });
  } catch (e: unknown) {
    return proxyFailedResponse(e);
  }
}
