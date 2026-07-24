export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getProviderId } from "@/app/api/lib/auth";
import {
  apiBase,
  unauthorizedResponse,
} from "@/app/api/admin/bookings/proxy.helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const BASE = apiBase();
  if (!BASE) {
    return NextResponse.json(
      { ok: false, error: "NEXT_BACKEND_API_BASE is missing" },
      { status: 500 },
    );
  }

  const pid = await getProviderId(req);
  if (!pid) return unauthorizedResponse();

  const { id } = await ctx.params;
  const url = `${BASE}/admin/bookings/${encodeURIComponent(
    id,
  )}/confirm?resend=1`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "x-provider-id": pid,
        accept: "application/json",
      },
      cache: "no-store",
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: "Proxy failed", detail },
      { status: 500 },
    );
  }
}
