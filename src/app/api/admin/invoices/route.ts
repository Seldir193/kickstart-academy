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

function buildUrl(req: NextRequest, path: string) {
  const base = baseFromEnv();
  const qs = req.nextUrl.searchParams.toString();
  return `${base}${path}${qs ? `?${qs}` : ""}`;
}

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    console.error("[invoices-proxy] NEXT_BACKEND_API_BASE is missing");
    return jsonError(
      500,
      "Server misconfigured: NEXT_BACKEND_API_BASE is missing",
    );
  }

  const providerId = await getProviderId(req);
  if (!providerId) return jsonError(401, "Unauthorized");

  const url = buildUrl(req, "/admin/invoices");

  try {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-provider-id": providerId,
      },
      cache: "no-store",
    });

    const body = await r.text();

    return new NextResponse(body, {
      status: r.status,
      headers: {
        "content-type": r.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("[invoices-proxy] fetch error:", e?.message || e);
    return jsonError(500, e?.message || "Proxy error");
  }
}
