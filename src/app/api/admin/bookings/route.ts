









// Lauf sicher im Node.js-Runtime (damit Buffer verfügbar ist)
export const runtime = 'nodejs';
// Keine Caches in dev
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from "next/server";

function clean(v: unknown) {
  return String(v ?? "").trim().replace(/^['"]|['"]$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    // nur eingeloggte Admins (Cookie)
    if (!req.cookies.get("admin_token")?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // ENV lesen (mit DEV-Fallback)
    const apiBase =
      clean(process.env.NEXT_BACKEND_API_BASE) || "http://127.0.0.1:5000/api";

    const envEmailRaw = process.env.ADMIN_EMAIL;
    const envPassRaw  = process.env.ADMIN_PASSWORD;
    const isDev = process.env.NODE_ENV !== "production";
    const adminEmail = clean(envEmailRaw || (isDev ? "admin@example.com" : ""));
    const adminPass  = clean(envPassRaw  || (isDev ? "supergeheim"     : ""));

    if (!adminEmail || !adminPass) {
      return NextResponse.json(
        { ok: false, error: "Admin credentials missing" },
        { status: 500 }
      );
    }

    const basic = Buffer.from(`${adminEmail}:${adminPass}`).toString("base64");

    // Query-Parameter durchreichen (z.B. ?status=pending)
    const url = new URL(`${apiBase}/bookings`);
    for (const [k, v] of req.nextUrl.searchParams) url.searchParams.append(k, v);

    const r = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${basic}` },
      cache: "no-store",
    });

    const text = await r.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    // Response 1:1 nach außen geben
    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    console.error("admin bookings proxy error:", e);
    return NextResponse.json(
      { ok: false, error: "Proxy failed", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
