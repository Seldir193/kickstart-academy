// // //src\app\api\admin\auth\login\route.ts
import { NextResponse } from "next/server";
import { signAdminToken } from "@/app/api/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clean = (v: unknown) => String(v ?? "").trim();

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return base.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = clean(body?.email).toLowerCase();
  const password = clean(body?.password);

  const r = await fetch(`${apiBase()}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const text = await r.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { ok: false, raw: text };
  }

  const user = data?.user ?? {};
  const userId = user?.id || user?._id;
  const userEmail = user?.email;

  const role = (user?.role === "super" ? "super" : "provider") as
    | "super"
    | "provider";

  const isOwner = Boolean(user?.isOwner === true);

  if (!r.ok || !userId || !userEmail) {
    return NextResponse.json(data || { ok: false, error: "Login failed" }, {
      status: r.status || 500,
    });
  }

  const token = await signAdminToken({
    id: String(userId),
    email: String(userEmail),
    role,
    isOwner,
  });

  const res = NextResponse.json({
    ok: true,
    user: { ...user, id: String(userId), role, isOwner },
  });

  res.headers.set("Cache-Control", "no-store");

  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: isProd,
  });

  return res;
}

// import { NextResponse } from "next/server";
// import { signAdminToken } from "@/app/api/lib/auth";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// const clean = (v: unknown) => String(v ?? "").trim();

// function apiBase() {
//   const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
//   return base.replace(/\/+$/, "");
// }

// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));
//   const email = clean(body?.email).toLowerCase();
//   const password = clean(body?.password);

//   const r = await fetch(`${apiBase()}/admin/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//     cache: "no-store",
//   });

//   const text = await r.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }

//   const user = data?.user ?? {};
//   const userId = user?.id || user?._id;
//   const userEmail = user?.email;
//   const role = (user?.role === "super" ? "super" : "provider") as
//     | "super"
//     | "provider";

//   if (!r.ok || !userId || !userEmail) {
//     return NextResponse.json(data || { ok: false, error: "Login failed" }, {
//       status: r.status || 500,
//     });
//   }

//   const token = await signAdminToken({
//     id: String(userId),
//     email: String(userEmail),
//     role,
//   });

//   const res = NextResponse.json({
//     ok: true,
//     user: { ...user, id: String(userId), role },
//   });

//   res.headers.set("Cache-Control", "no-store");

//   const isProd = process.env.NODE_ENV === "production";

//   res.cookies.set("admin_token", token, {
//     httpOnly: true,
//     sameSite: "lax",
//     path: "/",
//     maxAge: 60 * 60 * 24 * 7,
//     secure: isProd,
//   });

//   return res;
// }

// import { NextResponse } from "next/server";
// import { signAdminToken } from "@/app/api/lib/auth";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// const clean = (v: unknown) => String(v ?? "").trim();

// function apiBase() {
//   const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
//   return base.replace(/\/+$/, "");
// }

// function isLocalRequest(req: Request) {
//   const url = new URL(req.url);
//   const host = url.hostname;
//   return (
//     host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")
//   );
// }

// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));
//   const email = clean(body?.email).toLowerCase();
//   const password = clean(body?.password);

//   const r = await fetch(`${apiBase()}/admin/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//     cache: "no-store",
//   });

//   const text = await r.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }

//   const user = data?.user ?? {};
//   const userId = user?.id || user?._id;
//   const userEmail = user?.email;
//   const role = (user?.role === "super" ? "super" : "provider") as
//     | "super"
//     | "provider";

//   if (!r.ok || !userId || !userEmail) {
//     return NextResponse.json(data || { ok: false, error: "Login failed" }, {
//       status: r.status || 500,
//     });
//   }

//   const token = await signAdminToken({
//     id: String(userId),
//     email: String(userEmail),
//     role,
//   });

//   const res = NextResponse.json({
//     ok: true,
//     user: { ...user, id: String(userId), role },
//   });
//   res.headers.set("Cache-Control", "no-store");

//   // ✅ Lokal NICHT secure, sonst kein Cookie auf http://localhost
//   res.cookies.set("admin_token", token, {
//     httpOnly: true,
//     sameSite: "lax",
//     path: "/",
//     maxAge: 60 * 60 * 24 * 7,
//     secure: !isLocalRequest(req),
//   });

//   return res;
// }
