// app/api/admin/customers/[id]/bookings/[bid]/documents/[kind]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

type DocCtx = {
  params: Promise<{ id: string; bid: string; kind: string }>;
};

type BodyValue = string | File | null;
type BodyObject = Record<string, BodyValue>;

async function readBody(req: NextRequest): Promise<BodyObject> {
  try {
    if (req.method === "POST") {
      const ctype = req.headers.get("content-type") || "";

      if (ctype.includes("application/json")) {
        const j: unknown = await req.json().catch(() => ({}));
        if (j && typeof j === "object" && !Array.isArray(j)) {
          return j as Record<string, BodyValue>;
        }
        return {};
      }

      if (
        ctype.includes("application/x-www-form-urlencoded") ||
        ctype.includes("multipart/form-data")
      ) {
        const fd = await req.formData();
        return Object.fromEntries(fd.entries()) as BodyObject;
      }

      return {};
    }

    // GET: optionale Parameter aus Query übernehmen (z. B. amount, currency)
    const out: BodyObject = {};
    const sp = req.nextUrl.searchParams;
    for (const k of sp.keys()) out[k] = sp.get(k);
    return out;
  } catch {
    return {};
  }
}

async function forwardToBackendAsPost(
  req: NextRequest,
  p: { id: string; bid: string; kind: string }
) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: missing provider" },
      { status: 401 }
    );
  }

  const bodyObj = await readBody(req);

  const url =
    `${apiBase()}/customers/${encodeURIComponent(p.id)}` +
    `/bookings/${encodeURIComponent(p.bid)}/documents/${encodeURIComponent(
      p.kind
    )}`;

  const upstream = await fetch(url, {
    method: "POST", // immer als POST ins Backend
    headers: {
      "Content-Type": "application/json",
      "x-provider-id": pid,
    },
    cache: "no-store",
    body: JSON.stringify(bodyObj),
  });

  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/pdf",
      "Content-Disposition":
        upstream.headers.get("content-disposition") ||
        `inline; filename="${p.kind}.pdf"`,
    },
  });
}

// GET → an Backend-POST weiterleiten (für „im neuen Tab öffnen“)
export async function GET(req: NextRequest, ctx: DocCtx) {
  const params = await ctx.params;
  return forwardToBackendAsPost(req, params);
}

// POST → ebenfalls weiterleiten (falls du irgendwo per POST öffnest)
export async function POST(req: NextRequest, ctx: DocCtx) {
  const params = await ctx.params;
  return forwardToBackendAsPost(req, params);
}
