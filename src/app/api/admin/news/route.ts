// src/app/api/admin/news/route.ts
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

function stripProviderCreateFields(body: unknown) {
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

function buildProviderCreatePayload(body: unknown) {
  const base = stripProviderCreateFields(body);
  return { ...base, published: false, rejectionReason: "", rejectedAt: null };
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

async function requireMe(req: NextRequest): Promise<AuthResult> {
  const me = await fetchMe(req);

  if (!me) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true, me };
}

function queryString(req: NextRequest) {
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

async function proxy(path: string, method: string, me: Me, payload?: unknown) {
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

function buildCreatePayload(me: Me, body: unknown) {
  if (roleHeader(me) === "provider") {
    return buildProviderCreatePayload(body);
  }

  return normalizeNewsImages(body);
}

export async function GET(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const result = await proxy(`/admin/news${queryString(req)}`, "GET", auth.me);
  return json(result.data, result.status);
}

export async function POST(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = await readJson(req);
  const payload = buildCreatePayload(auth.me, body);
  const result = await proxy("/admin/news", "POST", auth.me, payload);

  return json(result.data, result.status);
}
