import { NextResponse, type NextRequest } from "next/server";

export type Me = { id: string; role: string; isSuperAdmin: boolean };
type AuthFail = { ok: false; status: number; error: string };
type AuthOk = { ok: true; me: Me };
export type AuthResult = AuthFail | AuthOk;

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return base.replace(/\/+$/, "");
}

function toStatus(v: unknown) {
  return typeof v === "number" && Number.isFinite(v) ? v : 500;
}

export function json(body: unknown, status?: number) {
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

export async function readJson(req: NextRequest) {
  return await req.json().catch(() => ({}));
}

export function roleHeader(me: Me) {
  return me.isSuperAdmin || me.role === "super" ? "super" : "provider";
}

function isPlainObject(v: unknown) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

export function toObject(v: unknown) {
  return isPlainObject(v) ? { ...(v as Record<string, unknown>) } : {};
}

export function hasOwn(obj: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
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

export async function requireMe(req: NextRequest): Promise<AuthResult> {
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

export async function proxy(
  path: string,
  method: string,
  me: Me,
  payload?: unknown,
) {
  const hasBody = payload !== undefined;
  const r = await fetch(`${apiBase()}${path}`, {
    method,
    headers: buildHeaders(me, hasBody),
    body: hasBody ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });
  return { status: toStatus(r.status), data: parseJson(await r.text()) };
}
