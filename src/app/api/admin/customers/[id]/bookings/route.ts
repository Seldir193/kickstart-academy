//src\app\api\admin\customers\[id]\bookings\route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

type Ctx = { params: Promise<{ id: string }> };

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const r = await fetch(
    `${apiBase()}/customers/${encodeURIComponent(id)}/bookings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Provider-Id": pid,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  const text = await r.text();
  const data = safeJsonParse(text);
  return NextResponse.json(data, { status: r.status });
}
