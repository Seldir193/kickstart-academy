export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

type Me = { id: string; role: string; isSuperAdmin: boolean };
type AuthFail = { ok: false; status: number; error: string };
type AuthOk = { ok: true; me: Me };
type AuthResult = AuthFail | AuthOk;
type Ctx = { params: Promise<{ slug: string }> };

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

function stripProviderFields(body: unknown) {
  const next = toObject(body);

  delete next.submitForReview;

  delete next.providerId;

  delete next.status;
  delete next.rejectionReason;
  delete next.rejectedAt;

  delete next.approvedAt;
  delete next.liveUpdatedAt;
  delete next.submittedAt;

  delete next.hasDraft;
  delete next.draft;
  delete next.draftUpdatedAt;

  delete next.lastProviderEditAt;
  delete next.lastSuperEditAt;

  delete next.lastChangeSummary;
  delete next.lastChangeAt;

  return next;
}

function buildProviderPayload(body: unknown) {
  const obj = toObject(body);

  if (obj.submitForReview === true) {
    return { submitForReview: true };
  }

  if (hasOwn(obj, "published")) {
    return { published: Boolean(obj.published) };
  }

  return stripProviderFields(obj);
}

function buildSuperPayload(body: unknown) {
  const next = toObject(body);
  delete next.submitForReview;
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

async function proxy(slug: string, method: string, me: Me, payload?: any) {
  const hasBody = payload !== undefined;
  const r = await fetch(
    `${apiBase()}/admin/coaches/${encodeURIComponent(slug)}`,
    {
      method,
      headers: buildHeaders(me, hasBody),
      body: hasBody ? JSON.stringify(payload) : undefined,
      cache: "no-store",
    },
  );
  return { status: toStatus(r.status), data: parseJson(await r.text()) };
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const { slug } = await ctx.params;
  const body = await readJson(req);

  const payload =
    roleHeader(auth.me) === "provider"
      ? buildProviderPayload(body)
      : buildSuperPayload(body);

  const result = await proxy(slug, "PATCH", auth.me, payload);
  return json(result.data, result.status);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const { slug } = await ctx.params;
  const result = await proxy(slug, "DELETE", auth.me);

  return json(result.data, result.status);
}

// //src\app\api\admin\coaches\[slug]\route.ts
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";

// function apiBase() {
//   const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
//   return base.replace(/\/+$/, "");
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

// function requireToken(req: NextRequest) {
//   return req.cookies.get("admin_token")?.value || "";
// }

// function readRawBody(req: NextRequest) {
//   return req.text().catch(() => "");
// }

// type Ctx = { params: Promise<{ slug: string }> };

// export async function PATCH(req: NextRequest, ctx: Ctx) {
//   if (!requireToken(req)) {
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

//   const { slug } = await ctx.params;
//   const body = await readRawBody(req);

//   const r = await fetch(
//     `${apiBase()}/admin/coaches/${encodeURIComponent(slug)}`,
//     {
//       method: "PATCH",
//       headers: {
//         "content-type": "application/json",
//         accept: "application/json",
//         "x-provider-id": me.id,
//         "x-admin-role": roleHeader(me),
//       },
//       body,
//       cache: "no-store",
//     },
//   );

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
//   if (!requireToken(req)) {
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

//   const { slug } = await ctx.params;

//   const r = await fetch(
//     `${apiBase()}/admin/coaches/${encodeURIComponent(slug)}`,
//     {
//       method: "DELETE",
//       headers: {
//         accept: "application/json",
//         "x-provider-id": me.id,
//         "x-admin-role": roleHeader(me),
//       },
//       cache: "no-store",
//     },
//   );

//   const text = await r.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }

//   return NextResponse.json(data, { status: r.status });
// }

// //src\app\api\admin\coaches\[slug]\route.ts
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";

// function apiBase() {
//   const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
//   return base.replace(/\/+$/, "");
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
//   let data: unknown;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = null;
//   }

//   const d = data as {
//     ok?: boolean;
//     user?: { id?: unknown; role?: unknown; isSuperAdmin?: unknown };
//   } | null;

//   if (!meRes.ok || !d?.ok || !d?.user?.id) return null;

//   return {
//     id: String(d.user.id),
//     role: String(d.user.role || "provider"),
//     isSuperAdmin: Boolean(d.user.isSuperAdmin),
//   };
// }

// type Ctx = { params: Promise<{ slug: string }> };

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

//   const { slug } = await ctx.params;

//   const roleHeader =
//     me.isSuperAdmin || me.role === "super" ? "super" : "provider";
//   const body = await req.text();

//   const r = await fetch(
//     `${apiBase()}/admin/coaches/${encodeURIComponent(slug)}`,
//     {
//       method: "PATCH",
//       headers: {
//         "content-type": "application/json",
//         accept: "application/json",
//         "x-provider-id": me.id,
//         "x-admin-role": roleHeader,
//       },
//       body,
//       cache: "no-store",
//     },
//   );

//   const text = await r.text();
//   let data: unknown;
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

//   const { slug } = await ctx.params;

//   const roleHeader =
//     me.isSuperAdmin || me.role === "super" ? "super" : "provider";

//   const r = await fetch(
//     `${apiBase()}/admin/coaches/${encodeURIComponent(slug)}`,
//     {
//       method: "DELETE",
//       headers: {
//         accept: "application/json",
//         "x-provider-id": me.id,
//         "x-admin-role": roleHeader,
//       },
//       cache: "no-store",
//     },
//   );

//   const text = await r.text();
//   let data: unknown;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }
//   return NextResponse.json(data, { status: r.status });
// }
