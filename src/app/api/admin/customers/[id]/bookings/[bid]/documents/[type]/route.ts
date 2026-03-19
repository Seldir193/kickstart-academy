// app/api/admin/customers/[id]/bookings/[bid]/documents/[type]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

type DocType = "participation" | "cancellation" | "storno";
type Ctx = { params: Promise<{ id: string; bid: string; type: DocType }> };

// GET -> proxied POST to backend that returns a PDF
export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id, bid, type } = await ctx.params;

    // 1) Try cookie
    let pid = await getProviderIdFromCookies();

    // 2) Fallback: ?pid=... for cases where new-tab nav doesn't bring cookie
    if (!pid) {
      const fromQS = req.nextUrl.searchParams.get("pid");
      if (fromQS) pid = fromQS;
    }
    if (!pid)
      return new NextResponse("Unauthorized: missing provider", {
        status: 401,
      });

    const allowed: ReadonlySet<DocType> = new Set([
      "participation",
      "cancellation",
      "storno",
    ]);
    if (!allowed.has(type))
      return new NextResponse("Invalid type", { status: 400 });

    const url =
      `${apiBase()}/customers/${encodeURIComponent(id)}` +
      `/bookings/${encodeURIComponent(bid)}/documents/${type}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "x-provider-id": pid },
      cache: "no-store",
    });

    // If backend failed, forward text to help debug (viewer will still show error)
    if (!r.ok) {
      const txt = await r.text();
      return new NextResponse(txt || `Upstream error ${r.status}`, {
        status: r.status,
      });
    }

    const buf = await r.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "content-type": r.headers.get("content-type") || "application/pdf",
        "content-disposition":
          r.headers.get("content-disposition") ||
          'inline; filename="document.pdf"',
        "cache-control": "no-store",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new NextResponse(`Proxy failed: ${msg}`, { status: 500 });
  }
}
