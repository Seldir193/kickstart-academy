// src/app/api/admin/franchise-locations/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

type Me = { id: string; role: string; isSuperAdmin: boolean };
type AuthFail = { ok: false; status: number; error: string };
type AuthOk = { ok: true; me: Me };
type AuthResult = AuthFail | AuthOk;
type Ctx = { params: Promise<{ id: string }> };

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return base.replace(/\/+$/, "");
}

function toStatus(v: unknown) {
  return typeof v === "number" && Number.isFinite(v) ? v : 500;
}

function json(body: any, status?: number) {
  return NextResponse.json(body, { status: toStatus(status) });
}

function hasToken(req: NextRequest) {
  return Boolean(req.cookies.get("admin_token")?.value || "");
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, raw: text };
  }
}

async function readJson(req: NextRequest) {
  return await req.json().catch(() => ({}));
}

function roleHeader(me: Me) {
  return me.isSuperAdmin || me.role === "super" ? "super" : "provider";
}

function isPlainObject(v: unknown) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function toObject(v: unknown) {
  return isPlainObject(v) ? { ...(v as any) } : {};
}

function hasOwn(obj: any, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function toBool(v: unknown) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1") return true;
    if (s === "false" || s === "0") return false;
  }
  return Boolean(v);
}

function stripProviderFields(body: unknown) {
  const next = toObject(body);

  delete next.submitForReview;
  delete next.published;

  delete next.status;
  delete next.rejectionReason;
  delete next.rejectedAt;
  delete next.approvedAt;
  delete next.liveUpdatedAt;
  delete next.draftUpdatedAt;
  delete next.submittedAt;
  delete next.moderatedAt;
  delete next.owner;

  delete next.hasDraft;
  delete next.draft;
  delete next.lastProviderEditAt;
  delete next.lastSuperEditAt;

  return next;
}

function buildProviderPayload(body: unknown) {
  const obj = toObject(body);

  if (obj.submitForReview === true) {
    const base = stripProviderFields(obj);
    return { ...base, submitForReview: true };
  }

  if (hasOwn(obj, "published")) {
    return { published: toBool(obj.published) };
  }

  return stripProviderFields(obj);
}

function buildSuperPayload(body: unknown) {
  return toObject(body);
}

async function fetchMe(req: NextRequest): Promise<Me | null> {
  const r = await fetch(new URL("/api/admin/auth/me", req.url), {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") || "",
      accept: "application/json",
    },
    cache: "no-store",
  });

  const data = parseJson(await r.text());
  if (!r.ok || !data?.ok || !data?.user?.id) return null;

  return {
    id: String(data.user.id),
    role: String(data.user.role || "provider"),
    isSuperAdmin: Boolean(data.user.isSuperAdmin),
  };
}

async function requireMe(req: NextRequest): Promise<AuthResult> {
  if (!hasToken(req)) return { ok: false, status: 401, error: "Unauthorized" };
  const me = await fetchMe(req);
  if (!me) return { ok: false, status: 401, error: "Unauthorized" };
  return { ok: true, me };
}

function buildHeaders(me: Me, hasBody: boolean) {
  const headers: Record<string, string> = {
    accept: "application/json",
    "x-provider-id": me.id,
    "x-admin-role": roleHeader(me),
  };
  if (hasBody) headers["content-type"] = "application/json";
  return headers;
}

async function proxy(id: string, method: string, me: Me, payload?: any) {
  const hasBody = payload !== undefined;
  const r = await fetch(`${apiBase()}/admin/franchise-locations/${id}`, {
    method,
    headers: buildHeaders(me, hasBody),
    body: hasBody ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });
  return { status: toStatus(r.status), data: parseJson(await r.text()) };
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = await readJson(req);
  const { id } = await ctx.params;

  const payload =
    roleHeader(auth.me) === "provider"
      ? buildProviderPayload(body)
      : buildSuperPayload(body);

  const result = await proxy(encodeURIComponent(id), "PATCH", auth.me, payload);
  return json(result.data, result.status);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  return PATCH(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const { id } = await ctx.params;
  const result = await proxy(encodeURIComponent(id), "DELETE", auth.me);

  return json(result.data, result.status);
}

// //src\app\api\admin\franchise-locations\[id]\route.ts
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";

// type Me = { id: string; role: string; isSuperAdmin: boolean };
// type AuthFail = { ok: false; status: number; error: string };
// type AuthOk = { ok: true; me: Me };
// type AuthResult = AuthFail | AuthOk;
// type Ctx = { params: Promise<{ id: string }> };

// function apiBase() {
//   const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
//   return base.replace(/\/+$/, "");
// }

// function toStatus(v: unknown) {
//   return typeof v === "number" && Number.isFinite(v) ? v : 500;
// }

// function json(body: any, status?: number) {
//   return NextResponse.json(body, { status: toStatus(status) });
// }

// function hasToken(req: NextRequest) {
//   return Boolean(req.cookies.get("admin_token")?.value || "");
// }

// function parseJson(text: string) {
//   try {
//     return JSON.parse(text);
//   } catch {
//     return { ok: false, raw: text };
//   }
// }

// async function readJson(req: NextRequest) {
//   return await req.json().catch(() => ({}));
// }

// function roleHeader(me: Me) {
//   return me.isSuperAdmin || me.role === "super" ? "super" : "provider";
// }

// function isPlainObject(v: unknown) {
//   return Boolean(v) && typeof v === "object" && !Array.isArray(v);
// }

// function toObject(v: unknown) {
//   return isPlainObject(v) ? { ...(v as any) } : {};
// }

// function hasOwn(obj: any, key: string) {
//   return Object.prototype.hasOwnProperty.call(obj, key);
// }

// // function stripProviderFields(body: unknown) {
// //   const next = toObject(body);

// //   delete next.status;
// //   delete next.rejectionReason;
// //   delete next.rejectedAt;
// //   delete next.approvedAt;
// //   delete next.liveUpdatedAt;
// //   delete next.draftUpdatedAt;
// //   delete next.submittedAt;
// //   delete next.moderatedAt;
// //   delete next.owner;

// //   return next;
// // }

// function stripProviderFields(body: unknown) {
//   const next = toObject(body);

//   delete next.submitForReview;
//   delete next.published;

//   delete next.status;
//   delete next.rejectionReason;
//   delete next.rejectedAt;
//   delete next.approvedAt;
//   delete next.liveUpdatedAt;
//   delete next.draftUpdatedAt;
//   delete next.submittedAt;
//   delete next.moderatedAt;
//   delete next.owner;

//   delete next.hasDraft;
//   delete next.draft;
//   delete next.lastProviderEditAt;
//   delete next.lastSuperEditAt;

//   return next;
// }

// function buildProviderPayload(body: unknown) {
//   const obj = toObject(body);

//   if (obj.submitForReview === true) {
//     const base = stripProviderFields(obj);
//     return { ...base, submitForReview: true };
//   }

//   if (hasOwn(obj, "published")) {
//     return { published: Boolean(obj.published) };
//   }

//   return stripProviderFields(obj);
// }

// function buildSuperPayload(body: unknown) {
//   return toObject(body);
// }

// async function fetchMe(req: NextRequest): Promise<Me | null> {
//   const r = await fetch(new URL("/api/admin/auth/me", req.url), {
//     method: "GET",
//     headers: {
//       cookie: req.headers.get("cookie") || "",
//       accept: "application/json",
//     },
//     cache: "no-store",
//   });

//   const data = parseJson(await r.text());
//   if (!r.ok || !data?.ok || !data?.user?.id) return null;

//   return {
//     id: String(data.user.id),
//     role: String(data.user.role || "provider"),
//     isSuperAdmin: Boolean(data.user.isSuperAdmin),
//   };
// }

// async function requireMe(req: NextRequest): Promise<AuthResult> {
//   if (!hasToken(req)) return { ok: false, status: 401, error: "Unauthorized" };
//   const me = await fetchMe(req);
//   if (!me) return { ok: false, status: 401, error: "Unauthorized" };
//   return { ok: true, me };
// }

// function buildHeaders(me: Me, hasBody: boolean) {
//   const headers: Record<string, string> = {
//     accept: "application/json",
//     "x-provider-id": me.id,
//     "x-admin-role": roleHeader(me),
//   };
//   if (hasBody) headers["content-type"] = "application/json";
//   return headers;
// }

// async function proxy(id: string, method: string, me: Me, payload?: any) {
//   const hasBody = payload !== undefined;
//   const r = await fetch(`${apiBase()}/admin/franchise-locations/${id}`, {
//     method,
//     headers: buildHeaders(me, hasBody),
//     body: hasBody ? JSON.stringify(payload) : undefined,
//     cache: "no-store",
//   });
//   return { status: toStatus(r.status), data: parseJson(await r.text()) };
// }

// export async function PATCH(req: NextRequest, ctx: Ctx) {
//   const auth = await requireMe(req);
//   if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

//   const body = await readJson(req);
//   const { id } = await ctx.params;

//   const payload =
//     roleHeader(auth.me) === "provider"
//       ? buildProviderPayload(body)
//       : buildSuperPayload(body);

//   const result = await proxy(encodeURIComponent(id), "PATCH", auth.me, payload);
//   return json(result.data, result.status);
// }

// export async function PUT(req: NextRequest, ctx: Ctx) {
//   return PATCH(req, ctx);
// }

// export async function DELETE(req: NextRequest, ctx: Ctx) {
//   const auth = await requireMe(req);
//   if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

//   const { id } = await ctx.params;
//   const result = await proxy(encodeURIComponent(id), "DELETE", auth.me);

//   return json(result.data, result.status);
// }

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextRequest, NextResponse } from "next/server";
// import { requireSuperAdmin } from "@/app/api/lib/auth";

// function apiBase() {
//   const b =
//     process.env.NEXT_BACKEND_API_BASE ||
//     process.env.NEXT_PUBLIC_API_URL ||
//     "http://127.0.0.1:5000/api";
//   return b.replace(/\/+$/, "");
// }

// async function guardOr401() {
//   const guard = await requireSuperAdmin();
//   return guard;
// }

// async function readBody(req: NextRequest) {
//   return await req.json().catch(() => ({}));
// }

// async function passthroughJson(r: Response) {
//   const text = await r.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }
//   return NextResponse.json(data, { status: r.status });
// }

// type Ctx = { params: Promise<{ id: string }> };

// export async function PATCH(req: NextRequest, ctx: Ctx) {
//   const guard = await guardOr401();
//   if (!guard.ok) {
//     return NextResponse.json(
//       { ok: false, error: guard.error },
//       { status: guard.status },
//     );
//   }

//   const body = await readBody(req);
//   const { id } = await ctx.params;

//   const r = await fetch(
//     `${apiBase()}/admin/franchise-locations/${encodeURIComponent(id)}`,
//     {
//       method: "PATCH",
//       headers: {
//         "content-type": "application/json",
//         accept: "application/json",
//         "x-provider-id": guard.claims.id,
//         "x-admin-role": "super",
//       },
//       body: JSON.stringify(body),
//       cache: "no-store",
//     },
//   );

//   return passthroughJson(r);
// }

// export async function PUT(req: NextRequest, ctx: Ctx) {
//   return PATCH(req, ctx);
// }

// export async function DELETE(_req: NextRequest, ctx: Ctx) {
//   const guard = await guardOr401();
//   if (!guard.ok) {
//     return NextResponse.json(
//       { ok: false, error: guard.error },
//       { status: guard.status },
//     );
//   }

//   const { id } = await ctx.params;

//   const r = await fetch(
//     `${apiBase()}/admin/franchise-locations/${encodeURIComponent(id)}`,
//     {
//       method: "DELETE",
//       headers: {
//         accept: "application/json",
//         "x-provider-id": guard.claims.id,
//         "x-admin-role": "super",
//       },
//       cache: "no-store",
//     },
//   );

//   return passthroughJson(r);
// }
