// app/api/admin/auth/users/route.ts
// app/api/admin/auth/users/route.ts
// app/api/admin/auth/users/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getProviderId } from "@/app/api/lib/auth";

function apiBase() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return raw.replace(/\/+$/, "");
}

function clean(v: unknown) {
  return String(v ?? "").trim();
}

export async function GET(req: NextRequest) {
  const BASE = apiBase();

  const providerId = await getProviderId(req);
  if (!providerId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const search = clean(req.nextUrl.searchParams.get("search"));
  const role = clean(req.nextUrl.searchParams.get("role"));
  const status = clean(req.nextUrl.searchParams.get("status"));
  //const active = clean(req.nextUrl.searchParams.get("active"));

  const target = new URL(`${BASE}/admin/auth/users`);
  if (search) target.searchParams.set("search", search);
  if (role) target.searchParams.set("role", role);
  if (status) target.searchParams.set("status", status);
  //if (active) target.searchParams.set("active", active);

  const r = await fetch(target.toString(), {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") || "",
      accept: "application/json",
      "x-provider-id": providerId,
    },
    cache: "no-store",
  });

  const text = await r.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { ok: false, raw: text };
  }

  return NextResponse.json(data, { status: r.status });
}

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextRequest, NextResponse } from "next/server";
// import { getProviderId } from "@/app/api/lib/auth";

// function apiBase() {
//   const raw =
//     process.env.NEXT_BACKEND_API_BASE ||
//     process.env.NEXT_PUBLIC_API_URL ||
//     "http://127.0.0.1:5000/api";
//   return raw.replace(/\/+$/, "");
// }

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// export async function GET(req: NextRequest) {
//   const BASE = apiBase();

//   const providerId = await getProviderId(req);
//   if (!providerId) {
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );
//   }

//   const search = clean(req.nextUrl.searchParams.get("search"));
//   const role = clean(req.nextUrl.searchParams.get("role"));
//   const status = clean(req.nextUrl.searchParams.get("status"));
//   const active = clean(req.nextUrl.searchParams.get("active"));

//   const target = new URL(`${BASE}/admin/auth/users`);
//   if (search) target.searchParams.set("search", search);
//   if (role) target.searchParams.set("role", role);
//   if (status) target.searchParams.set("status", status);
//   if (active) target.searchParams.set("active", active);

//   const r = await fetch(target.toString(), {
//     method: "GET",
//     headers: {
//       cookie: req.headers.get("cookie") || "",
//       accept: "application/json",
//       "x-provider-id": providerId,
//     },
//     cache: "no-store",
//   });

//   const text = await r.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }

//   return NextResponse.json(data, { status: r.status });
// }

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextRequest, NextResponse } from "next/server";
// import { getProviderId } from "@/app/api/lib/auth";

// function apiBase() {
//   const raw =
//     process.env.NEXT_BACKEND_API_BASE ||
//     process.env.NEXT_PUBLIC_API_URL ||
//     "http://127.0.0.1:5000/api";
//   return raw.replace(/\/+$/, "");
// }

// export async function GET(req: NextRequest) {
//   const BASE = apiBase();

//   const providerId = await getProviderId(req);
//   if (!providerId) {
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );
//   }

//   const qs = req.nextUrl.search; // keeps ?search=&role=&status=&active= etc.
//   //const target = `${BASE}/admin/auth/users${qs}`;
//   const target = new URL(`${BASE}/admin/auth/users${req.nextUrl.search}`);

//   const r = await fetch(target, {
//     method: "GET",
//     headers: {
//       cookie: req.headers.get("cookie") || "",
//       accept: "application/json",
//       "x-provider-id": providerId,
//     },
//     cache: "no-store",
//   });

//   const text = await r.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }

//   return NextResponse.json(data, { status: r.status });
// }

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextRequest, NextResponse } from "next/server";
// import { getProviderId } from "@/app/api/lib/auth";

// function apiBase() {
//   const raw =
//     process.env.NEXT_BACKEND_API_BASE ||
//     process.env.NEXT_PUBLIC_API_URL ||
//     "http://127.0.0.1:5000/api";
//   return raw.replace(/\/+$/, "");
// }

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// export async function GET(req: NextRequest) {
//   const BASE = apiBase();

//   const providerId = await getProviderId(req);
//   if (!providerId) {
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );
//   }

//   const search = clean(req.nextUrl.searchParams.get("search"));
//   const role = clean(req.nextUrl.searchParams.get("role"));

//   const target = new URL(`${BASE}/admin/auth/users`);
//   if (search) target.searchParams.set("search", search);
//   if (role) target.searchParams.set("role", role);

//   const r = await fetch(target.toString(), {
//     method: "GET",
//     headers: {
//       cookie: req.headers.get("cookie") || "",
//       accept: "application/json",
//       "x-provider-id": providerId,
//     },
//     cache: "no-store",
//   });

//   const text = await r.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }

//   return NextResponse.json(data, { status: r.status });
// }
