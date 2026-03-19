// src/app/api/admin/news/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

type Me = { id: string; role: string; isSuperAdmin: boolean };
type AuthFail = { ok: false; status: number; error: string };
type AuthOk = { ok: true; me: Me };
type AuthResult = AuthFail | AuthOk;

type Ctx = { params: Promise<{ id: string }> };

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

function toStatus(v: unknown) {
  return typeof v === "number" && Number.isFinite(v) ? v : 500;
}

function json(body: any, status?: number) {
  return NextResponse.json(body, { status: toStatus(status) });
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

function stripProviderFields(body: unknown) {
  const next = toObject(body);
  delete (next as any).submitForReview;
  delete (next as any).published;
  delete (next as any).rejectionReason;
  delete (next as any).rejectedAt;
  delete (next as any).rejectedBy;
  delete (next as any).rejectedById;
  delete (next as any).status;
  return next;
}

function buildProviderPayload(body: unknown) {
  const obj = toObject(body);

  if ((obj as any).submitForReview === true) {
    const base = stripProviderFields(obj);
    return { ...base, submitForReview: true };
  }

  if (hasOwn(obj, "published")) {
    return { published: Boolean((obj as any).published) };
  }

  return stripProviderFields(obj);
}

function buildSuperPayload(body: unknown) {
  const next = toObject(body);
  delete (next as any).submitForReview;
  return next;
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

  const r = await fetch(`${apiBase()}/admin/news/${id}`, {
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

  const result = await proxy(id, "PATCH", auth.me, payload);
  return json(result.data, result.status);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const { id } = await ctx.params;
  const result = await proxy(id, "DELETE", auth.me);

  return json(result.data, result.status);
}

// // src/app/api/admin/news/[id]/route.ts
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

// function stripProviderFields(body: unknown) {
//   const next = toObject(body);

//   delete (next as any).submitForReview;
//   delete (next as any).published;
//   delete (next as any).rejectionReason;
//   delete (next as any).rejectedAt;
//   delete (next as any).rejectedBy;
//   delete (next as any).rejectedById;
//   delete (next as any).status;

//   return next;
// }

// function buildProviderPayload(body: unknown) {
//   const obj = toObject(body);

//   if ((obj as any).submitForReview === true) {
//     const base = stripProviderFields(obj);
//     return { ...base, submitForReview: true };
//   }

//   if (hasOwn(obj, "published")) {
//     return { published: Boolean((obj as any).published) };
//   }

//   return stripProviderFields(obj);
// }

// function buildSuperPayload(body: unknown) {
//   const next = toObject(body);
//   delete (next as any).submitForReview;
//   return next;
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
//   const r = await fetch(`${apiBase()}/admin/news/${id}`, {
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

//   const result = await proxy(id, "PATCH", auth.me, payload);
//   return json(result.data, result.status);
// }

// export async function DELETE(req: NextRequest, ctx: Ctx) {
//   const auth = await requireMe(req);
//   if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

//   const { id } = await ctx.params;
//   const result = await proxy(id, "DELETE", auth.me);

//   return json(result.data, result.status);
// }

// // src/app/api/admin/news/[id]/route.ts
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

// function stripProviderFields(body: unknown) {
//   const next = toObject(body);

//   delete next.submitForReview;
//   delete next.published;
//   delete next.rejectionReason;
//   delete next.rejectedAt;
//   delete next.rejectedBy;
//   delete next.rejectedById;
//   delete next.status;

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
//   const next = toObject(body);
//   delete next.submitForReview;
//   return next;
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
//   const r = await fetch(`${apiBase()}/admin/news/${id}`, {
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

//   const result = await proxy(id, "PATCH", auth.me, payload);
//   return json(result.data, result.status);
// }

// export async function DELETE(req: NextRequest, ctx: Ctx) {
//   const auth = await requireMe(req);
//   if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

//   const { id } = await ctx.params;
//   const result = await proxy(id, "DELETE", auth.me);

//   return json(result.data, result.status);
// }

// // src/app/api/admin/news/[id]/route.ts
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

// function stripProviderFields(body: unknown) {
//   const next = toObject(body);
//   delete next.submitForReview;
//   delete next.published;
//   delete next.rejectionReason;
//   delete next.rejectedAt;
//   delete next.rejectedBy;
//   delete next.rejectedById;
//   delete next.status;
//   return next;
// }

// function buildProviderPayload(body: unknown) {
//   const submit = Boolean((toObject(body) as any).submitForReview === true);
//   if (!submit) return stripProviderFields(body);
//   return { ...stripProviderFields(body), submitForReview: true };
// }

// function buildSuperPayload(body: unknown) {
//   const next = toObject(body);
//   delete next.submitForReview;
//   return next;
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
//   const r = await fetch(`${apiBase()}/admin/news/${id}`, {
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
//   const result = await proxy(id, "PATCH", auth.me, payload);

//   return json(result.data, result.status);
// }

// export async function DELETE(req: NextRequest, ctx: Ctx) {
//   const auth = await requireMe(req);
//   if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

//   const { id } = await ctx.params;
//   const result = await proxy(id, "DELETE", auth.me);

//   return json(result.data, result.status);
// }

// // src/app/admin/(app)/news/[id]/route.ts
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";

// function apiBase() {
//   const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
//   return base.replace(/\/+$/, "");
// }

// async function readBody(req: NextRequest) {
//   return await req.json().catch(() => ({}));
// }

// async function getMe(req: NextRequest) {
//   const meRes = await fetch(new URL("/api/admin/auth/me", req.url), {
//     method: "GET",
//     headers: {
//       cookie: req.headers.get("cookie") || "",
//       accept: "application/json",
//     },
//     cache: "no-store",
//   });

//   const text = await meRes.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }

//   if (!meRes.ok || !data?.ok || !data?.user?.id) return null;

//   return {
//     id: String(data.user.id),
//     role: String(data.user.role || "provider"),
//     isSuperAdmin: Boolean(data.user.isSuperAdmin),
//   };
// }

// function roleHeader(me: { role?: string; isSuperAdmin?: boolean }) {
//   return me?.isSuperAdmin || me?.role === "super" ? "super" : "provider";
// }

// function isObject(v: unknown) {
//   return !!v && typeof v === "object" && !Array.isArray(v);
// }

// function stripProviderFields(body: any) {
//   const next = isObject(body) ? { ...body } : {};
//   delete next.submitForReview;
//   delete next.published;
//   delete next.rejectionReason;
//   delete next.rejectedAt;
//   delete next.rejectedBy;
//   delete next.rejectedById;
//   return next;
// }

// function buildReviewPayload(body: any) {
//   const base = stripProviderFields(body);
//   return { ...base, submitForReview: true };
// }

// type Ctx = { params: Promise<{ id: string }> };

// export async function PATCH(req: NextRequest, ctx: Ctx) {
//   const token = req.cookies.get("admin_token")?.value || "";
//   if (!token) {
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );
//   }

//   const me = await getMe(req);
//   if (!me) {
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );
//   }

//   const body = await readBody(req);
//   const { id } = await ctx.params;

//   const role = roleHeader(me);
//   const submitForReview = Boolean(
//     isObject(body) && (body as any).submitForReview === true,
//   );

//   const payload =
//     role === "provider"
//       ? submitForReview
//         ? buildReviewPayload(body)
//         : stripProviderFields(body)
//       : (() => {
//           const next = isObject(body) ? { ...body } : {};
//           delete (next as any).submitForReview;
//           return next;
//         })();

//   const r = await fetch(`${apiBase()}/admin/news/${id}`, {
//     method: "PATCH",
//     headers: {
//       "content-type": "application/json",
//       accept: "application/json",
//       "x-provider-id": me.id,
//       "x-admin-role": role,
//     },
//     body: JSON.stringify(payload),
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

// export async function DELETE(req: NextRequest, ctx: Ctx) {
//   const token = req.cookies.get("admin_token")?.value || "";
//   if (!token) {
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );
//   }

//   const me = await getMe(req);
//   if (!me) {
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );
//   }

//   const { id } = await ctx.params;

//   const r = await fetch(`${apiBase()}/admin/news/${id}`, {
//     method: "DELETE",
//     headers: {
//       accept: "application/json",
//       "x-provider-id": me.id,
//       "x-admin-role": roleHeader(me),
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
