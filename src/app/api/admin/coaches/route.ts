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

function stripProviderCreateFields(body: unknown) {
  const next = toObject(body);

  delete next.providerId;

  delete next.status;
  delete next.published;
  delete next.rejectionReason;
  delete next.rejectedAt;

  delete next.submittedAt;
  delete next.approvedAt;
  delete next.liveUpdatedAt;

  delete next.hasDraft;
  delete next.draft;
  delete next.draftUpdatedAt;

  delete next.lastProviderEditAt;
  delete next.lastSuperEditAt;

  delete next.lastChangeSummary;
  delete next.lastChangeAt;

  return next;
}

function buildProviderCreatePayload(body: unknown) {
  const base = stripProviderCreateFields(body);
  return {
    ...base,
    status: "pending",
    published: false,
    rejectionReason: "",
    rejectedAt: null,
  };
}

function buildSuperCreatePayload(body: unknown) {
  return toObject(body);
}

async function proxy(method: string, me: Me, payload?: any, qs?: string) {
  const hasBody = payload !== undefined;
  const url = `${apiBase()}/admin/coaches${qs ? `?${qs}` : ""}`;

  const r = await fetch(url, {
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

  const url = new URL(req.url);
  const qs = url.searchParams.toString();

  const result = await proxy("GET", auth.me, undefined, qs);
  return json(result.data, result.status);
}

export async function POST(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = await readJson(req);

  const payload =
    roleHeader(auth.me) === "provider"
      ? buildProviderCreatePayload(body)
      : buildSuperCreatePayload(body);

  const result = await proxy("POST", auth.me, payload);
  return json(result.data, result.status);
}

// //src\app\api\admin\coaches\route.ts
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
//   delete (next as any).status;
//   delete (next as any).published;
//   delete (next as any).rejectionReason;
//   delete (next as any).rejectedAt;
//   delete (next as any).approvedAt;
//   delete (next as any).liveUpdatedAt;
//   delete (next as any).lastSuperEditAt;

//   return {
//     ...next,
//     status: "pending",
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

//   const r = await fetch(`${apiBase()}/admin/coaches${qs ? `?${qs}` : ""}`, {
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

//   const r = await fetch(`${apiBase()}/admin/coaches`, {
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

// //src\app\api\admin\coaches\route.ts
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
//     data = null;
//   }

//   if (!meRes.ok || !data?.ok || !data?.user?.id) return null;

//   return {
//     id: String(data.user.id),
//     role: String(data.user.role || "provider"),
//     isSuperAdmin: Boolean(data.user.isSuperAdmin),
//   };
// }

// export async function GET(req: NextRequest) {
//   const token = req.cookies.get("admin_token")?.value || "";
//   if (!token)
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );

//   const me = await getMe(req);
//   if (!me)
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );

//   const roleHeader =
//     me.isSuperAdmin || me.role === "super" ? "super" : "provider";
//   const qs = new URL(req.url).searchParams.toString();

//   const r = await fetch(`${apiBase()}/admin/coaches${qs ? `?${qs}` : ""}`, {
//     method: "GET",
//     headers: {
//       accept: "application/json",
//       "x-provider-id": me.id,
//       "x-admin-role": roleHeader,
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
//   if (!token)
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );

//   const me = await getMe(req);
//   if (!me)
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );

//   const roleHeader =
//     me.isSuperAdmin || me.role === "super" ? "super" : "provider";
//   const body = await req.text();

//   const r = await fetch(`${apiBase()}/admin/coaches`, {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//       accept: "application/json",
//       "x-provider-id": me.id,
//       "x-admin-role": roleHeader,
//     },
//     body,
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
