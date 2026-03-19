// src/app/api/admin/news/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

type Me = { id: string; role: string; isSuperAdmin: boolean };
type AuthFail = { ok: false; status: number; error: string };
type AuthOk = { ok: true; me: Me };
type AuthResult = AuthFail | AuthOk;

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

function stripProviderCreateFields(body: unknown) {
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

function buildProviderCreatePayload(body: unknown) {
  const base = stripProviderCreateFields(body);
  return { ...base, published: false, rejectionReason: "", rejectedAt: null };
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

function queryString(req: NextRequest) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  return qs ? `?${qs}` : "";
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

async function proxy(path: string, method: string, me: Me, payload?: any) {
  const hasBody = payload !== undefined;

  const r = await fetch(`${apiBase()}${path}`, {
    method,
    headers: buildHeaders(me, hasBody),
    body: hasBody ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });

  return { status: toStatus(r.status), data: parseJson(await r.text()) };
}

export async function GET(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const result = await proxy(`/admin/news${queryString(req)}`, "GET", auth.me);
  return json(result.data, result.status);
}

export async function POST(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = await readJson(req);
  const payload =
    roleHeader(auth.me) === "provider"
      ? buildProviderCreatePayload(body)
      : toObject(body);

  const result = await proxy("/admin/news", "POST", auth.me, payload);
  return json(result.data, result.status);
}

// // src/app/api/admin/news/route.ts
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";

// type Me = { id: string; role: string; isSuperAdmin: boolean };
// type AuthFail = { ok: false; status: number; error: string };
// type AuthOk = { ok: true; me: Me };
// type AuthResult = AuthFail | AuthOk;

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

// function stripProviderCreateFields(body: unknown) {
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

// function buildProviderCreatePayload(body: unknown) {
//   const base = stripProviderCreateFields(body);
//   return { ...base, published: false, rejectionReason: "", rejectedAt: null };
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

// function queryString(req: NextRequest) {
//   const url = new URL(req.url);
//   const qs = url.searchParams.toString();
//   return qs ? `?${qs}` : "";
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

// async function proxy(path: string, method: string, me: Me, payload?: any) {
//   const hasBody = payload !== undefined;
//   const r = await fetch(`${apiBase()}${path}`, {
//     method,
//     headers: buildHeaders(me, hasBody),
//     body: hasBody ? JSON.stringify(payload) : undefined,
//     cache: "no-store",
//   });

//   return { status: toStatus(r.status), data: parseJson(await r.text()) };
// }

// export async function GET(req: NextRequest) {
//   const auth = await requireMe(req);
//   if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

//   const result = await proxy(`/admin/news${queryString(req)}`, "GET", auth.me);
//   return json(result.data, result.status);
// }

// export async function POST(req: NextRequest) {
//   const auth = await requireMe(req);
//   if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

//   const body = await readJson(req);
//   const payload =
//     roleHeader(auth.me) === "provider"
//       ? buildProviderCreatePayload(body)
//       : toObject(body);

//   const result = await proxy("/admin/news", "POST", auth.me, payload);
//   return json(result.data, result.status);
// }

// // src/app/api/admin/news/route.ts
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";

// type Me = { id: string; role: string; isSuperAdmin: boolean };
// type AuthFail = { ok: false; status: number; error: string };
// type AuthOk = { ok: true; me: Me };
// type AuthResult = AuthFail | AuthOk;

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

// function stripProviderCreateFields(body: unknown) {
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

// function buildProviderCreatePayload(body: unknown) {
//   const base = stripProviderCreateFields(body);
//   return { ...base, published: false, rejectionReason: "", rejectedAt: null };
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

// function queryString(req: NextRequest) {
//   const url = new URL(req.url);
//   const qs = url.searchParams.toString();
//   return qs ? `?${qs}` : "";
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

// async function proxy(path: string, method: string, me: Me, payload?: any) {
//   const hasBody = payload !== undefined;
//   const r = await fetch(`${apiBase()}${path}`, {
//     method,
//     headers: buildHeaders(me, hasBody),
//     body: hasBody ? JSON.stringify(payload) : undefined,
//     cache: "no-store",
//   });
//   return { status: toStatus(r.status), data: parseJson(await r.text()) };
// }

// export async function GET(req: NextRequest) {
//   const auth = await requireMe(req);
//   if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

//   const result = await proxy(`/admin/news${queryString(req)}`, "GET", auth.me);
//   return json(result.data, result.status);
// }

// export async function POST(req: NextRequest) {
//   const auth = await requireMe(req);
//   if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

//   const body = await readJson(req);
//   const payload =
//     roleHeader(auth.me) === "provider"
//       ? buildProviderCreatePayload(body)
//       : toObject(body);

//   const result = await proxy("/admin/news", "POST", auth.me, payload);
//   return json(result.data, result.status);
// }

// //src\app\api\admin\news\route.ts
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

// function providerCreatePayload(body: any) {
//   const next = isObject(body) ? { ...body } : {};
//   delete (next as any).submitForReview;
//   delete (next as any).published;
//   delete (next as any).rejectionReason;
//   delete (next as any).rejectedAt;
//   delete (next as any).rejectedBy;
//   delete (next as any).rejectedById;

//   return {
//     ...next,
//     published: false,
//     rejectionReason: "",
//     rejectedAt: null,
//   };
// }

// export async function GET(req: NextRequest) {
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

//   const url = new URL(req.url);
//   const qs = url.searchParams.toString();

//   const r = await fetch(`${apiBase()}/admin/news${qs ? `?${qs}` : ""}`, {
//     method: "GET",
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

// export async function POST(req: NextRequest) {
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
//   const role = roleHeader(me);

//   const payload = role === "provider" ? providerCreatePayload(body) : body;

//   const r = await fetch(`${apiBase()}/admin/news`, {
//     method: "POST",
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
