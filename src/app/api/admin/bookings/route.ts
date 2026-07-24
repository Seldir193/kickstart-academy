export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";
import {
  apiBase,
  passthroughUpstream,
  unauthorizedResponse,
} from "@/app/api/admin/bookings/proxy.helpers";

export async function GET(req: NextRequest) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) return unauthorizedResponse();

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

    return passthroughUpstream(r);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Proxy failed", detail: String(e?.message ?? e) },
      { status: 500 },
    );
  }
}
