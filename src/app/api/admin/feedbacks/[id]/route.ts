export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

type Me = { id: string; role: string; isSuperAdmin: boolean };
type AuthFail = { ok: false; status: number; error: string };
type AuthOk = { ok: true; me: Me };
type AuthResult = AuthFail | AuthOk;
type Ctx = { params: Promise<{ id: string }> };

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

function toStatus(v: unknown) {
  return typeof v === "number" && Number.isFinite(v) ? v : 500;
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

async function readJson(req: NextRequest) {
  return await req.json().catch(() => ({}));
}

function roleHeader(me: Me) {
  return me.isSuperAdmin || me.role === "super" ? "super" : "provider";
}

function isSuper(me: Me) {
  return me.isSuperAdmin === true || me.role === "super";
}

function isPlainObject(v: unknown) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function toObject(v: unknown) {
  return isPlainObject(v) ? { ...(v as Record<string, unknown>) } : {};
}

function stripLocalOrigin(value: string) {
  return value.replace(/^https?:\/\/localhost:\d+/i, "");
}

function legacyAdminUploadPath(value: string) {
  const match = value.match(/^\/api\/admin\/upload\/([^/?#]+)$/i);
  if (!match) return "";
  return `/uploads/news/${decodeURIComponent(match[1])}`;
}

function normalizeUploadPath(value: unknown) {
  const imageUrl = stripLocalOrigin(String(value ?? "").trim());
  if (!imageUrl || imageUrl.startsWith("data:image/")) return "";
  if (imageUrl.startsWith("/uploads/")) return imageUrl;
  return legacyAdminUploadPath(imageUrl);
}

function normalizeFeedbackPayload(value: unknown) {
  const payload = toObject(value);
  return { ...payload, imageUrl: normalizeUploadPath(payload.imageUrl) };
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

async function requireSuper(req: NextRequest): Promise<AuthResult> {
  const me = await fetchMe(req);
  if (!me) return { ok: false, status: 401, error: "Unauthorized" };
  if (!isSuper(me)) return { ok: false, status: 403, error: "Forbidden" };
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

async function proxy(path: string, method: string, me: Me, payload?: unknown) {
  const hasBody = payload !== undefined;

  const r = await fetch(`${apiBase()}${path}`, {
    method,
    headers: buildHeaders(me, hasBody),
    body: hasBody ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });

  return { status: toStatus(r.status), data: parseJson(await r.text()) };
}

async function feedbackPath(ctx: Ctx) {
  const { id } = await ctx.params;
  return `/admin/feedbacks/${encodeURIComponent(id)}`;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const payload = normalizeFeedbackPayload(await readJson(req));
  const result = await proxy(
    await feedbackPath(ctx),
    "PATCH",
    auth.me,
    payload,
  );

  return json(result.data, result.status);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const result = await proxy(await feedbackPath(ctx), "DELETE", auth.me);

  return json(result.data, result.status);
}
