//src\app\api\public\pay\route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

function apiBase() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return raw.replace(/\/+$/, "");
}

async function readBody(req: NextRequest) {
  return req.json().catch(() => ({}));
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  const bookingId = String(body?.bookingId || "").trim();
  if (!bookingId) {
    return NextResponse.json(
      { ok: false, error: "bookingId is required" },
      { status: 400 },
    );
  }

  const r = await fetch(`${apiBase()}/payments/stripe/checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId }),
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
