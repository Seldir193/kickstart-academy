export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";

type Me = { id: string; role: string; isSuperAdmin: boolean };
type AuthFail = { ok: false; status: number; error: string };
type AuthOk = { ok: true; me: Me };
type AuthResult = AuthFail | AuthOk;

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return base.replace(/\/+$/, "");
}

function toStatus(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 500;
}

function json(body: unknown, status?: number) {
  return NextResponse.json(body, { status: toStatus(status) });
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, raw: text };
  }
}

function getAuthHeaders(req: NextRequest) {
  return {
    cookie: req.headers.get("cookie") || "",
    accept: "application/json",
  };
}

function roleHeader(me: Me) {
  return me.isSuperAdmin || me.role === "super" ? "super" : "provider";
}

function buildMe(user: any): Me {
  return {
    id: String(user.id),
    role: String(user.role || "provider"),
    isSuperAdmin: Boolean(user.isSuperAdmin),
  };
}

async function fetchMe(req: NextRequest): Promise<Me | null> {
  const response = await fetch(new URL("/api/admin/auth/me", req.url), {
    method: "GET",
    headers: getAuthHeaders(req),
    cache: "no-store",
  });

  const data = parseJson(await response.text());
  if (!response.ok || !data?.ok || !data?.user?.id) return null;

  return buildMe(data.user);
}

async function requireMe(req: NextRequest): Promise<AuthResult> {
  const me = await fetchMe(req);

  if (!me) return { ok: false, status: 401, error: "Unauthorized" };

  return { ok: true, me };
}

function buildHeaders(me: Me) {
  return {
    accept: "application/json",
    "content-type": "application/json",
    "x-provider-id": me.id,
    "x-admin-role": roleHeader(me),
  };
}

async function proxyTranslate(me: Me, payload: unknown) {
  const response = await fetch(`${apiBase()}/admin/news/translate`, {
    method: "POST",
    headers: buildHeaders(me),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return {
    status: toStatus(response.status),
    data: parseJson(await response.text()),
  };
}

export async function POST(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = await req.json().catch(() => ({}));
  const result = await proxyTranslate(auth.me, body);

  return json(result.data, result.status);
}
