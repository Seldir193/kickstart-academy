export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";

type Me = { id: string; role: string; isSuperAdmin: boolean };
type AuthFail = { ok: false; status: number; error: string };
type AuthOk = { ok: true; me: Me };
type AuthResult = AuthFail | AuthOk;
type Ctx = { params: Promise<{ id: string }> };

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

async function readJson(req: NextRequest) {
  return await req.json().catch(() => ({}));
}

function roleHeader(me: Me) {
  return me.isSuperAdmin || me.role === "super" ? "super" : "provider";
}

function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toObject(value: unknown) {
  return isPlainObject(value) ? { ...(value as Record<string, any>) } : {};
}

function hasOwn(obj: Record<string, any>, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function normalizeAbsoluteAdminUploadUrl(url: string) {
  return url.replace(
    /^https?:\/\/[^/]+\/api\/admin\/upload\//i,
    "/uploads/news/",
  );
}

function normalizeNewsImageUrl(value: unknown) {
  const url = String(value || "")
    .trim()
    .replaceAll("\\", "/");
  const normalizedUrl = normalizeAbsoluteAdminUploadUrl(url);

  if (!normalizedUrl || normalizedUrl.startsWith("data:image/")) return "";

  if (normalizedUrl.startsWith("/api/admin/upload/")) {
    return normalizedUrl.replace("/api/admin/upload/", "/uploads/news/");
  }

  if (normalizedUrl.startsWith("api/admin/upload/")) {
    return `/${normalizedUrl}`.replace("/api/admin/upload/", "/uploads/news/");
  }

  if (normalizedUrl.startsWith("uploads/news/")) return `/${normalizedUrl}`;

  return normalizedUrl;
}

function normalizeNewsImages(body: unknown) {
  const next = toObject(body);
  const keys = ["imageUrl", "image", "coverImage", "thumbnail"];

  keys.forEach((key) => {
    if (key in next) next[key] = normalizeNewsImageUrl(next[key]);
  });

  return next;
}

function stripProviderFields(body: unknown) {
  const next = normalizeNewsImages(body);

  delete next.submitForReview;
  delete next.published;
  delete next.rejectionReason;
  delete next.rejectedAt;
  delete next.rejectedBy;
  delete next.rejectedById;
  delete next.status;

  return next;
}

function buildProviderPayload(body: unknown) {
  const obj = normalizeNewsImages(body);

  if (obj.submitForReview === true) {
    const base = stripProviderFields(obj);
    return { ...base, submitForReview: true };
  }

  if (hasOwn(obj, "published")) {
    return { published: Boolean(obj.published) };
  }

  return stripProviderFields(obj);
}

function buildSuperPayload(body: unknown) {
  const next = normalizeNewsImages(body);
  delete next.submitForReview;

  return next;
}

function getAuthHeaders(req: NextRequest) {
  return {
    cookie: req.headers.get("cookie") || "",
    accept: "application/json",
  };
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

  if (!me) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

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

async function proxy(id: string, method: string, me: Me, payload?: unknown) {
  const hasBody = payload !== undefined;
  const response = await fetch(`${apiBase()}/admin/news/${id}`, {
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

function buildPatchPayload(me: Me, body: unknown) {
  if (roleHeader(me) === "provider") {
    return buildProviderPayload(body);
  }

  return buildSuperPayload(body);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);

  if (!auth.ok) {
    return json({ ok: false, error: auth.error }, auth.status);
  }

  const body = await readJson(req);
  const { id } = await ctx.params;
  const payload = buildPatchPayload(auth.me, body);
  const result = await proxy(id, "PATCH", auth.me, payload);

  return json(result.data, result.status);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);

  if (!auth.ok) {
    return json({ ok: false, error: auth.error }, auth.status);
  }

  const { id } = await ctx.params;
  const result = await proxy(id, "DELETE", auth.me);

  return json(result.data, result.status);
}
