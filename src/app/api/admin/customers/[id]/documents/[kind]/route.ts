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

async function readJsonBody(req: NextRequest): Promise<BodyObject> {
  const j: unknown = await req.json().catch(() => ({}));
  if (j && typeof j === "object" && !Array.isArray(j)) {
    return j as Record<string, BodyValue>;
  }
  return {};
}

async function readPostBody(req: NextRequest): Promise<BodyObject> {
  const ctype = req.headers.get("content-type") || "";

  if (ctype.includes("application/json")) {
    return readJsonBody(req);
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

function readQueryBody(req: NextRequest): BodyObject {
  const out: BodyObject = {};
  const sp = req.nextUrl.searchParams;
  for (const k of sp.keys()) out[k] = sp.get(k);
  return out;
}

async function readBody(req: NextRequest): Promise<BodyObject> {
  try {
    if (req.method === "POST") {
      return await readPostBody(req);
    }
    return readQueryBody(req);
  } catch {
    return {};
  }
}

function documentUrl(p: { id: string; bid: string; kind: string }) {
  return (
    `${apiBase()}/customers/${encodeURIComponent(p.id)}` +
    `/bookings/${encodeURIComponent(p.bid)}/documents/${encodeURIComponent(
      p.kind,
    )}`
  );
}

async function forwardToBackendAsPost(
  req: NextRequest,
  p: { id: string; bid: string; kind: string },
) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: missing provider" },
      { status: 401 },
    );
  }

  const bodyObj = await readBody(req);

  const upstream = await fetch(documentUrl(p), {
    method: "POST", // the backend always expects document requests as POST
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

export async function GET(req: NextRequest, ctx: DocCtx) {
  const params = await ctx.params;
  return forwardToBackendAsPost(req, params);
}

export async function POST(req: NextRequest, ctx: DocCtx) {
  const params = await ctx.params;
  return forwardToBackendAsPost(req, params);
}
