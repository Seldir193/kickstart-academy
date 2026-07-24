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
