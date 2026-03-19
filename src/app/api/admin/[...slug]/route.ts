// // app/api/admin/[...slug]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAdminClaimsFromCookies, getProviderId } from "@/app/api/lib/auth";

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return raw.replace(/\/$/, "");
}

const EXCLUDE_PREFIXES = ["auth"];

function shouldExclude(slug: string[]) {
  const first = (slug[0] || "").toLowerCase();
  return EXCLUDE_PREFIXES.includes(first);
}

function buildUpstreamUrl(BASE: string, slug: string[], req: NextRequest) {
  const search = req.nextUrl.search || "";
  const path = slug.map((s) => encodeURIComponent(s)).join("/");

  const first = (slug[0] || "").toLowerCase();
  if (["customers", "offers", "places"].includes(first)) {
    return `${BASE}/${path}${search}`;
  }

  return `${BASE}/admin/${path}${search}`;
}

async function forward(
  req: NextRequest,
  upstreamUrl: string,
  providerId: string,
  role?: string,
) {
  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const headers: Record<string, string> = {
    "x-provider-id": providerId,
    accept: req.headers.get("accept") || "*/*",
  };

  if (role === "super") headers["x-admin-role"] = "super";

  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  const up = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const res = new NextResponse(up.body, {
    status: up.status,
    headers: {
      "content-type":
        up.headers.get("content-type") || "application/octet-stream",
    },
  });

  const cd = up.headers.get("content-disposition");
  const len = up.headers.get("content-length");
  if (cd) res.headers.set("content-disposition", cd);
  if (len) res.headers.set("content-length", len);
  return res;
}

type RouteCtx = { params: Promise<{ slug?: string[] }> };

async function handler(req: NextRequest, ctx: RouteCtx) {
  const BASE = baseFromEnv();
  if (!BASE) {
    return NextResponse.json(
      { ok: false, error: "NEXT_BACKEND_API_BASE is missing" },
      { status: 500 },
    );
  }

  const { slug } = await ctx.params;
  const parts = slug || [];

  if (shouldExclude(parts)) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 },
    );
  }

  const claims = await getAdminClaimsFromCookies();
  const providerId = await getProviderId(req);
  if (!providerId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const upstreamUrl = buildUpstreamUrl(BASE, parts, req);
    return await forward(req, upstreamUrl, providerId, claims?.role);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: "Proxy error", detail: msg },
      { status: 500 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextRequest, NextResponse } from "next/server";
// import { getProviderId } from "@/app/api/lib/auth";

// function baseFromEnv() {
//   const raw =
//     process.env.NEXT_BACKEND_API_BASE ||
//     process.env.NEXT_PUBLIC_API_URL ||
//     "http://127.0.0.1:5000/api";
//   return raw.replace(/\/$/, "");
// }

// // Nur auth ausnehmen, damit deine eigenen /api/admin/auth/* Routen greifen
// const EXCLUDE_PREFIXES = ["auth"];

// function shouldExclude(slug: string[]) {
//   const first = (slug[0] || "").toLowerCase();
//   return EXCLUDE_PREFIXES.includes(first);
// }

// function buildUpstreamUrl(BASE: string, slug: string[], req: NextRequest) {
//   const search = req.nextUrl.search || "";
//   const path = slug.map((s) => encodeURIComponent(s)).join("/");

//   // Diese drei gehen an die "öffentlichen" Backend-Routen:
//   // /api/admin/customers -> /api/customers
//   // /api/admin/offers    -> /api/offers
//   // /api/admin/places    -> /api/places
//   const first = (slug[0] || "").toLowerCase();
//   if (["customers", "offers", "places"].includes(first)) {
//     return `${BASE}/${path}${search}`;
//   }

//   // alles andere bleibt unter /api/admin/...
//   return `${BASE}/admin/${path}${search}`;
// }

// async function forward(
//   req: NextRequest,
//   upstreamUrl: string,
//   providerId: string
// ) {
//   const method = req.method.toUpperCase();
//   const hasBody = !["GET", "HEAD"].includes(method);
//   const body = hasBody ? await req.arrayBuffer() : undefined;

//   const headers: Record<string, string> = {
//     "x-provider-id": providerId,
//     accept: req.headers.get("accept") || "*/*",
//   };

//   const ct = req.headers.get("content-type");
//   if (ct) headers["content-type"] = ct;

//   const up = await fetch(upstreamUrl, {
//     method,
//     headers,
//     body,
//     cache: "no-store",
//   });

//   const res = new NextResponse(up.body, {
//     status: up.status,
//     headers: {
//       "content-type":
//         up.headers.get("content-type") || "application/octet-stream",
//     },
//   });

//   const cd = up.headers.get("content-disposition");
//   const len = up.headers.get("content-length");
//   if (cd) res.headers.set("content-disposition", cd);
//   if (len) res.headers.set("content-length", len);
//   return res;
// }

// /**
//  * Next 15: ctx.params ist Promise.
//  * Bei Catch-all: slug?: string[]
//  */
// type RouteCtx = { params: Promise<{ slug?: string[] }> };

// async function handler(req: NextRequest, ctx: RouteCtx) {
//   const BASE = baseFromEnv();
//   if (!BASE) {
//     return NextResponse.json(
//       { ok: false, error: "NEXT_BACKEND_API_BASE is missing" },
//       { status: 500 }
//     );
//   }

//   const { slug } = await ctx.params;
//   const parts = slug || [];

//   if (shouldExclude(parts)) {
//     return NextResponse.json(
//       { ok: false, error: "Not found" },
//       { status: 404 }
//     );
//   }

//   const providerId = await getProviderId(req);
//   if (!providerId) {
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   try {
//     const upstreamUrl = buildUpstreamUrl(BASE, parts, req);
//     return await forward(req, upstreamUrl, providerId);
//   } catch (e: unknown) {
//     const msg = e instanceof Error ? e.message : String(e);
//     return NextResponse.json(
//       { ok: false, error: "Proxy error", detail: msg },
//       { status: 500 }
//     );
//   }
// }

// export const GET = handler;
// export const POST = handler;
// export const PUT = handler;
// export const PATCH = handler;
// export const DELETE = handler;
// export const HEAD = handler;
// export const OPTIONS = handler;
