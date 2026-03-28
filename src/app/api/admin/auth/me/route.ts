// // app/api/admin/auth/me/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

type JwtPayload = {
  email?: string;
  role?: string;
  sub?: string;
  id?: string;
  providerId?: string;
  isOwner?: boolean;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function json(body: any, status: number) {
  return NextResponse.json(body, { status });
}

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const b64 =
      payload.replace(/-/g, "+").replace(/_/g, "/") +
      "===".slice((payload.length + 3) % 4);

    const bin = Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(bin) as T;
  } catch {
    return null;
  }
}

function roleFrom(v: unknown) {
  const r = clean(v).toLowerCase();
  return r === "super" ? "super" : "provider";
}

async function fetchProfile(req: NextRequest, id: string) {
  const url = new URL(`/api/admin/auth/profile`, req.url);
  url.searchParams.set("id", id);

  const r = await fetch(url.toString(), {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") || "",
      accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await r.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!r.ok || !data?.ok) return null;

  const user = data?.user || {};
  const uid = clean(user.id || user._id);
  if (!uid) return null;

  return {
    id: uid,
    fullName: clean(user.fullName) || null,
    email: clean(user.email) || null,
    avatarUrl: clean(user.avatarUrl) || null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const jwt = clean(req.cookies.get("admin_token")?.value);
    if (!jwt) return json({ ok: false, error: "Unauthorized" }, 401);

    const payload = decodeJwtPayload<JwtPayload>(jwt);
    const id = clean(payload?.sub || payload?.id || payload?.providerId);

    const email = clean(payload?.email);
    if (!id) return json({ ok: false, error: "Unauthorized" }, 401);

    const role = roleFrom(payload?.role);
    const isSuperAdmin = role === "super";
    const isOwner = Boolean(payload?.isOwner === true);

    const profile = await fetchProfile(req, id);

    return NextResponse.json({
      ok: true,
      user: {
        id,
        fullName: profile?.fullName ?? null,
        email: profile?.email ?? email,
        avatarUrl: profile?.avatarUrl ?? null,
        role,
        isSuperAdmin,
        isOwner,
      },
    });
  } catch (e: any) {
    return json(
      { ok: false, error: "Server error", detail: clean(e?.message || e) },
      500,
    );
  }
}

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";

// type JwtPayload = {
//   email?: string;
//   role?: string;
//   sub?: string;
//   id?: string;
//   providerId?: string;
// };

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function json(body: any, status: number) {
//   return NextResponse.json(body, { status });
// }

// function decodeJwtPayload<T = any>(token: string): T | null {
//   try {
//     const [, payload] = token.split(".");
//     if (!payload) return null;

//     const b64 =
//       payload.replace(/-/g, "+").replace(/_/g, "/") +
//       "===".slice((payload.length + 3) % 4);

//     const bin = Buffer.from(b64, "base64").toString("utf8");
//     return JSON.parse(bin) as T;
//   } catch {
//     return null;
//   }
// }

// function roleFrom(v: unknown) {
//   const r = clean(v).toLowerCase();
//   return r || "provider";
// }

// async function fetchProfile(req: NextRequest, email: string) {
//   const url = new URL(`/api/admin/auth/profile`, req.url);
//   url.searchParams.set("email", email);

//   const r = await fetch(url.toString(), {
//     method: "GET",
//     headers: {
//       cookie: req.headers.get("cookie") || "",
//       accept: "application/json",
//     },
//     cache: "no-store",
//   });

//   const text = await r.text();
//   let data: any = null;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = null;
//   }

//   if (!r.ok || !data?.ok) return null;

//   const user = data?.user || {};
//   const id = clean(user.id || user._id);
//   if (!id) return null;

//   return {
//     id,
//     fullName: clean(user.fullName) || null,
//     email: clean(user.email) || email,
//     avatarUrl: clean(user.avatarUrl) || null,
//   };
// }

// export async function GET(req: NextRequest) {
//   try {
//     const jwt = clean(req.cookies.get("admin_token")?.value);
//     const payload = jwt ? decodeJwtPayload<JwtPayload>(jwt) : null;

//     const emailFromJwt = clean(payload?.email);
//     const emailCookie = clean(
//       req.cookies.get("admin_email")?.value || req.cookies.get("email")?.value,
//     );

//     const email = clean(emailFromJwt || emailCookie);
//     if (!email) return json({ ok: false, error: "Unauthorized" }, 401);

//     const role = roleFrom(payload?.role);
//     const isSuperAdmin = role === "super";

//     const profile = await fetchProfile(req, email);
//     if (!profile) return json({ ok: false, error: "Unauthorized" }, 401);

//     return NextResponse.json({
//       ok: true,
//       user: {
//         id: profile.id,
//         fullName: profile.fullName,
//         email: profile.email,
//         avatarUrl: profile.avatarUrl,
//         role,
//         isSuperAdmin,
//       },
//     });
//   } catch (e: any) {
//     return json(
//       { ok: false, error: "Server error", detail: clean(e?.message || e) },
//       500,
//     );
//   }
// }

// // app/api/admin/auth/me/route.ts
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";

// type JwtPayload = {
//   sub?: string;
//   id?: string;
//   email?: string;
//   role?: string;
// };

// /** minimal JWT base64url decode (ohne verify; reicht hier für ID/Rolle/E-Mail-Auslesen) */
// function decodeJwtPayload<T = any>(token: string): T | null {
//   try {
//     const [, payload] = token.split(".");
//     if (!payload) return null;

//     const b64 =
//       payload.replace(/-/g, "+").replace(/_/g, "/") +
//       "===".slice((payload.length + 3) % 4);

//     const bin = Buffer.from(b64, "base64").toString("utf8");
//     return JSON.parse(bin) as T;
//   } catch {
//     return null;
//   }
// }

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function parseJson(text: string) {
//   try {
//     return JSON.parse(text);
//   } catch {
//     return { ok: false, raw: text };
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     const jwt = req.cookies.get("admin_token")?.value || "";
//     const payload = jwt ? decodeJwtPayload<JwtPayload>(jwt) : null;

//     const emailFromJwt = clean(payload?.email);
//     const roleFromJwt = clean(payload?.role).toLowerCase();
//     const idFromJwt = clean(payload?.sub || payload?.id);

//     const emailCookie =
//       req.cookies.get("admin_email")?.value ||
//       req.cookies.get("email")?.value ||
//       "";

//     const email = clean(emailFromJwt || emailCookie);

//     if (!email) {
//       return NextResponse.json(
//         { ok: false, error: "Unauthorized" },
//         { status: 401 },
//       );
//     }

//     const role = roleFromJwt || null;
//     const isSuperAdmin = roleFromJwt === "super";

//     const url = new URL(`/api/admin/auth/profile`, req.url);
//     url.searchParams.set("email", email);

//     const r = await fetch(url.toString(), {
//       method: "GET",
//       headers: {
//         cookie: req.headers.get("cookie") || "",
//         accept: "application/json",
//       },
//       cache: "no-store",
//     });

//     const text = await r.text();
//     const data: any = parseJson(text);

//     const fallbackUser = {
//       id: idFromJwt || null,
//       fullName: null,
//       email,
//       avatarUrl: null,
//       role,
//       isSuperAdmin,
//     };

//     if (!r.ok) {
//       return NextResponse.json(
//         { ok: true, user: fallbackUser },
//         { status: 200 },
//       );
//     }

//     const user = data?.user || {};
//     return NextResponse.json({
//       ok: true,
//       user: {
//         id: clean(user.id || user._id || idFromJwt) || null,
//         fullName: user.fullName || null,
//         email: user.email || email,
//         avatarUrl: user.avatarUrl || null,
//         role,
//         isSuperAdmin,
//       },
//     });
//   } catch (e: any) {
//     return NextResponse.json(
//       { ok: false, error: "Server error", detail: String(e?.message || e) },
//       { status: 500 },
//     );
//   }
// }

// // app/api/admin/auth/me/route.ts
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";

// /** minimal JWT base64url decode (ohne verify; reicht hier für E-Mail/Rolle-Auslesen) */
// function decodeJwtPayload<T = any>(token: string): T | null {

//   try {
//     const [, payload] = token.split(".");
//     if (!payload) return null;

//     const b64 =
//       payload.replace(/-/g, "+").replace(/_/g, "/") +
//       "===".slice((payload.length + 3) % 4);

//     const bin = Buffer.from(b64, "base64").toString("utf8");
//     return JSON.parse(bin) as T;
//   } catch {
//     return null;
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     // 1) E-Mail + Rolle aus JWT lesen (bevorzugt)
//     const jwt = req.cookies.get("admin_token")?.value || "";
//     const payload = jwt
//       ? decodeJwtPayload<{ email?: string; role?: string }>(jwt)
//       : null;

//     const emailFromJwt = (payload?.email || "").trim();
//     const roleFromJwt = (payload?.role || "").trim().toLowerCase();

//     // 2) Fallbacks: Cookies
//     const emailCookie =
//       req.cookies.get("admin_email")?.value ||
//       req.cookies.get("email")?.value ||
//       "";

//     const email = (emailFromJwt || emailCookie).trim();

//     if (!email) {
//       return NextResponse.json(
//         { ok: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const role = roleFromJwt || null;
//     const isSuperAdmin = role === "super";

//     // 3) Dein eigener Profile-Proxy liefert fullName zurück
//     const url = new URL(`/api/admin/auth/profile`, req.url);
//     url.searchParams.set("email", email);

//     const r = await fetch(url.toString(), {
//       method: "GET",
//       headers: {
//         // Cookie-Header durchreichen, damit /profile ggf. providerId aus Cookies/JWT ziehen kann
//         cookie: req.headers.get("cookie") || "",
//         accept: "application/json",
//       },
//       cache: "no-store",
//     });

//     const text = await r.text();
//     let data: any;
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = { ok: false, raw: text };
//     }

//     if (!r.ok) {
//       // Fallback: gib wenigstens die E-Mail zurück
//       return NextResponse.json(
//         {
//           ok: true,
//           user: {
//             id: null,
//             fullName: null,
//             email,
//             avatarUrl: null,
//             role,
//             isSuperAdmin,
//           },
//         },
//         { status: 200 }
//       );
//     }

//     const user = data?.user || {};
//     return NextResponse.json({
//       ok: true,
//       user: {
//         id: user.id || user._id || null,
//         fullName: user.fullName || null,
//         email: user.email || email,
//         avatarUrl: user.avatarUrl || null,
//         role,
//         isSuperAdmin,
//       },
//     });
//   } catch (e: any) {
//     return NextResponse.json(
//       { ok: false, error: "Server error", detail: String(e?.message || e) },
//       { status: 500 }
//     );
//   }
// }
