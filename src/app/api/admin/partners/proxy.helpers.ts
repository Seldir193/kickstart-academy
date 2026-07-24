import { NextResponse, type NextRequest } from "next/server";

export type Me = { id: string; role: string; isSuperAdmin: boolean };
type AuthFail = { ok: false; status: number; error: string };
type AuthOk = { ok: true; me: Me };
export type AuthResult = AuthFail | AuthOk;

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

function toStatus(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 500;
}

export function json(body: unknown, status?: number) {
  return NextResponse.json(body, { status: toStatus(status) });
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

function roleHeader(me: Me) {
  return me.isSuperAdmin || me.role === "super" ? "super" : "provider";
}

function isSuper(me: Me) {
  return me.isSuperAdmin === true || me.role === "super";
}

function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function toObject(value: unknown) {
  return isPlainObject(value) ? { ...(value as Record<string, unknown>) } : {};
}

async function fetchMe(req: NextRequest): Promise<Me | null> {
  const response = await fetch(new URL("/api/admin/auth/me", req.url), {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") || "",
      accept: "application/json",
    },
    cache: "no-store",
  });

  const data = parseJson(await response.text());
  if (!response.ok || !data?.ok || !data?.user?.id) return null;

  return {
    id: String(data.user.id),
    role: String(data.user.role || "provider"),
    isSuperAdmin: Boolean(data.user.isSuperAdmin),
  };
}

export async function requireSuper(req: NextRequest): Promise<AuthResult> {
  const me = await fetchMe(req);
  if (!me) return { ok: false, status: 401, error: "Unauthorized" };
  if (!isSuper(me)) return { ok: false, status: 403, error: "Forbidden" };
  return { ok: true, me };
}

export function queryString(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.toString();
  return query ? `?${query}` : "";
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

  const response = await fetch(`${apiBase()}${path}`, {
    method,
    headers: buildHeaders(me, hasBody),
    body: hasBody ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });

  return {
    status: toStatus(response.status),
    data: parseJson(await response.text()),
  };
}
