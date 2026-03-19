import { NextResponse } from "next/server";

function apiBase() {
  return String(process.env.NEXT_BACKEND_API_BASE || "").replace(/\/+$/, "");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();
  if (!token)
    return NextResponse.json(
      { ok: false, code: "MISSING_TOKEN" },
      { status: 400 },
    );

  const upstream = `${apiBase()}/public/weekly/contract-preview?token=${encodeURIComponent(token)}`;
  const r = await fetch(upstream, { method: "GET" });

  if (!r.ok) {
    const ct = r.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await r.json().catch(() => null);
      return NextResponse.json(j || { ok: false, code: "UPSTREAM" }, {
        status: r.status,
      });
    }
    return NextResponse.json(
      { ok: false, code: "UPSTREAM" },
      { status: r.status },
    );
  }

  const buf = Buffer.from(await r.arrayBuffer());
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Vertrag.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
