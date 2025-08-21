import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok:false, error:"Invalid JSON body" }, { status:400 });
  }

  try {
    const url = `${base}/bookings`;
    console.log("[proxy] POST", url); // DEBUG
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const ct = r.headers.get("content-type") || "";
    const payload = ct.includes("application/json")
      ? await r.json().catch(() => ({}))
      : await r.text();

    if (!r.ok) {
      return NextResponse.json(
        typeof payload === "object" ? payload : { ok:false, error:String(payload) },
        { status: r.status }
      );
    }
    return NextResponse.json(payload, { status: r.status });
  } catch (err: any) {
    console.error("[proxy] upstream error:", err?.message || err);
    return NextResponse.json(
      { ok:false, error:"Upstream fetch failed", detail:String(err?.message ?? err) },
      { status: 502 }
    );
  }
}
