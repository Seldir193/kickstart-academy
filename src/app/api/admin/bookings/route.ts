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

export async function GET(req: NextRequest) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const url = new URL(`${apiBase()}/bookings`);

    req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    const r = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Provider-Id": pid,
      },
      cache: "no-store",
    });

    const body = await r.text();
    return new NextResponse(body, {
      status: r.status,
      headers: {
        "content-type": r.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Proxy failed", detail: String(e?.message ?? e) },
      { status: 500 },
    );
  }
}
