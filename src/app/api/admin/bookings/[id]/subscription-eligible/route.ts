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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;
  const bodyIn = await req.json().catch(() => ({}));
  const qs = new URL(req.url).search;

  const r = await fetch(
    `${apiBase()}/bookings/${encodeURIComponent(id)}/subscription-eligible${qs}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Provider-Id": pid },
      body: JSON.stringify(bodyIn),
      cache: "no-store",
    },
  );

  const body = await r.text();
  return new NextResponse(body, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
