// // src/app/api/lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret",
);

export type AdminRole = "provider" | "super";

export type AdminClaims = {
  id: string;
  email: string;
  role: AdminRole;
  isOwner: boolean;
};

export async function getAdminTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get("admin_token")?.value || null;
}

export async function getAdminRoleFromCookies(): Promise<AdminRole | null> {
  const claims = await getAdminClaimsFromCookies();
  return claims?.role ?? null;
}

export async function getProviderId(req?: NextRequest): Promise<string | null> {
  const hdr = req?.headers.get("x-provider-id");
  if (hdr && hdr.trim()) return hdr.trim();

  const ckReq =
    req?.cookies.get("providerId")?.value ||
    req?.cookies.get("adminProviderId")?.value ||
    req?.cookies.get("aid")?.value;
  if (ckReq && String(ckReq).trim()) return String(ckReq).trim();

  const q = req?.nextUrl?.searchParams?.get("providerId");
  if (q && q.trim()) return q.trim();

  try {
    const store = await cookies();
    const token = store.get("admin_token")?.value;
    if (token) {
      const { payload } = await jwtVerify(token, secret);
      const sub = String(payload.sub || "");
      if (sub) return sub;
    }

    const pid =
      store.get("providerId")?.value ||
      store.get("adminProviderId")?.value ||
      store.get("aid")?.value;
    if (pid && String(pid).trim()) return String(pid).trim();
  } catch {}

  return null;
}

export async function getProviderIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const sub = String(payload.sub || "");
      if (sub) return sub;
    } catch {}
  }

  const pid = store.get("providerId")?.value;
  return pid ? String(pid) : null;
}

export async function signAdminToken(payload: {
  id: string;
  email: string;
  role: AdminRole;
  isOwner?: boolean;
}) {
  return await new SignJWT({
    email: payload.email,
    role: payload.role,
    isOwner: Boolean(payload.isOwner),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getAdminClaimsFromCookies(): Promise<AdminClaims | null> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);

    const id = String(payload.sub || "");
    const email = String((payload as any).email || "");
    const roleRaw = String((payload as any).role || "");
    const isOwner = Boolean((payload as any).isOwner === true);

    let role: AdminRole = "provider";
    if (roleRaw === "super") role = "super";
    if (roleRaw === "provider") role = "provider";

    if (!id) return null;
    return { id, email, role, isOwner };
  } catch {
    return null;
  }
}

export async function requireSuperAdmin() {
  const claims = await getAdminClaimsFromCookies();
  if (!claims)
    return { ok: false as const, status: 401, error: "Unauthorized" };
  if (claims.role !== "super")
    return { ok: false as const, status: 403, error: "Forbidden" };
  return { ok: true as const, claims };
}

export async function requireProvider() {
  const providerId = await getProviderIdFromCookies();
  if (!providerId)
    return { ok: false as const, status: 401, error: "Unauthorized" };
  return { ok: true as const, providerId };
}

// import { cookies } from "next/headers";
// import { SignJWT, jwtVerify } from "jose";
// import type { NextRequest } from "next/server";

// /**
//  * AUTH_SECRET:
//  * In Next .env.local setzen:
//  * AUTH_SECRET=<sehr_langer_random_string>
//  *
//  * Fallback "dev-secret" ist nur DEV ok.
//  */
// const secret = new TextEncoder().encode(
//   process.env.AUTH_SECRET || "dev-secret"
// );

// export type AdminRole = "provider" | "super";

// export type AdminClaims = {
//   id: string; // kommt aus JWT.sub
//   email: string;
//   role: AdminRole;
// };

// /* =========================
//    Legacy Helper (Fix TS2305)
//    ========================= */

// /** ✅ Kompatibilität: manche Dateien importieren das noch */
// export async function getAdminTokenFromCookies(): Promise<string | null> {
//   const store = await cookies();
//   return store.get("admin_token")?.value || null;
// }

// /** ✅ Kompatibilität: alte Variante "role aus Cookie" */
// export async function getAdminRoleFromCookies(): Promise<AdminRole | null> {
//   const claims = await getAdminClaimsFromCookies();
//   return claims?.role ?? null;
// }

// /* =========================
//    ProviderId lesen
//    ========================= */

// /**
//  * providerId aus Request (Header/Cookies/Query) oder serverseitig aus JWT.
//  * Nutze das, wenn du in Route.ts ein NextRequest hast.
//  */
// export async function getProviderId(req?: NextRequest): Promise<string | null> {
//   // 1) Header
//   const hdr = req?.headers.get("x-provider-id");
//   if (hdr && hdr.trim()) return hdr.trim();

//   // 2) Request Cookies (nur Legacy-Fallback)
//   const ckReq =
//     req?.cookies.get("providerId")?.value ||
//     req?.cookies.get("adminProviderId")?.value ||
//     req?.cookies.get("aid")?.value;
//   if (ckReq && String(ckReq).trim()) return String(ckReq).trim();

//   // 3) Query
//   const q = req?.nextUrl?.searchParams?.get("providerId");
//   if (q && q.trim()) return q.trim();

//   // 4) Serverseitig aus Cookies: erst JWT, dann Legacy
//   try {
//     const store = await cookies();

//     // 4a) JWT bevorzugt
//     const token = store.get("admin_token")?.value;
//     if (token) {
//       const { payload } = await jwtVerify(token, secret);
//       const sub = String(payload.sub || "");
//       if (sub) return sub;
//     }

//     // 4b) Legacy Klartext
//     const pid =
//       store.get("providerId")?.value ||
//       store.get("adminProviderId")?.value ||
//       store.get("aid")?.value;
//     if (pid && String(pid).trim()) return String(pid).trim();
//   } catch {
//     // ignore
//   }

//   return null;
// }

// /**
//  * Serverseitig providerId primär aus HttpOnly-JWT ziehen.
//  * Nutze das z.B. in Proxys wie /api/admin/places.
//  */
// export async function getProviderIdFromCookies(): Promise<string | null> {
//   const store = await cookies();

//   // 1) JWT bevorzugt
//   const token = store.get("admin_token")?.value;
//   if (token) {
//     try {
//       const { payload } = await jwtVerify(token, secret);
//       const sub = String(payload.sub || "");
//       if (sub) return sub;
//     } catch {
//       // ignore
//     }
//   }

//   // 2) Legacy Klartext
//   const pid = store.get("providerId")?.value;
//   return pid ? String(pid) : null;
// }

// /* =========================
//    JWT signieren / Claims
//    ========================= */

// export async function signAdminToken(payload: {
//   id: string;
//   email: string;
//   role: AdminRole;
// }) {
//   return await new SignJWT({ email: payload.email, role: payload.role })
//     .setProtectedHeader({ alg: "HS256", typ: "JWT" })
//     .setSubject(payload.id) // sub = providerId / adminId
//     .setIssuedAt()
//     .setExpirationTime("7d")
//     .sign(secret);
// }

// /**
//  * Claims (id/email/role) aus HttpOnly-JWT (admin_token) lesen.
//  * Nutze das in Superadmin-Routen für role === "super".
//  */
// export async function getAdminClaimsFromCookies(): Promise<AdminClaims | null> {
//   const store = await cookies();
//   const token = store.get("admin_token")?.value;
//   if (!token) return null;

//   try {
//     const { payload } = await jwtVerify(token, secret);

//     const id = String(payload.sub || "");
//     const email = String((payload as any).email || "");
//     const roleRaw = String((payload as any).role || "");

//     let role: AdminRole = "provider";
//     if (roleRaw === "super") role = "super";
//     if (roleRaw === "provider") role = "provider";

//     if (!id) return null;
//     return { id, email, role };
//   } catch {
//     return null;
//   }
// }

// /* =========================
//    Guards (praktisch)
//    ========================= */

// export async function requireSuperAdmin() {
//   const claims = await getAdminClaimsFromCookies();
//   if (!claims) {
//     return { ok: false as const, status: 401, error: "Unauthorized" };
//   }
//   if (claims.role !== "super") {
//     return { ok: false as const, status: 403, error: "Forbidden" };
//   }
//   return { ok: true as const, claims };
// }

// export async function requireProvider() {
//   const providerId = await getProviderIdFromCookies();
//   if (!providerId) {
//     return { ok: false as const, status: 401, error: "Unauthorized" };
//   }
//   return { ok: true as const, providerId };
// }
