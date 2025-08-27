// Lauf sicher in Node & ohne Cache
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from "next/server";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  // Body lesen (sanft)
  let body: any;
  try {
    body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const url = `${apiBase()}/bookings`;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // hilfreiche Forward-Header fürs Backend-Logging/Rate-Limit:
        "X-Forwarded-For": req.headers.get("x-forwarded-for") ?? "",
        "X-Real-IP": req.headers.get("x-real-ip") ?? "",
        "User-Agent": req.headers.get("user-agent") ?? "kickstart-academy/next-proxy",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await r.text();
    // robustes JSON-Fallback
    let payload: any;
    try { payload = JSON.parse(text); }
    catch { payload = { ok: r.ok, raw: text }; }

    return NextResponse.json(payload, { status: r.status });
  } catch (err: any) {
    console.error("[public bookings proxy] upstream error:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Upstream fetch failed", detail: String(err?.message ?? err) },
      { status: 502 }
    );
  }
}
