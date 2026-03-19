// family/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const r = await fetch(
    `${apiBase()}/customers/${encodeURIComponent(id)}/family`,
    {
      method: "GET",
      headers: {
        "X-Provider-Id": pid,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const body = await r.text();
  return new NextResponse(body, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
