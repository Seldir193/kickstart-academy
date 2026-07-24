import { type NextRequest } from "next/server";
import { cookies } from "next/headers";

type JwtClaims = {
  id?: unknown;
  sub?: unknown;
  providerId?: unknown;
  user?: { id?: unknown; _id?: unknown } | null;
};

export function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return base.replace(/\/+$/, "");
}

export function safeJson(text: string) {
  try {
    return JSON.parse(text || "{}");
  } catch {
    return { raw: text };
  }
}

function decodeJwtPayload<T = unknown>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const b64 =
      payload.replace(/-/g, "+").replace(/_/g, "/") +
      "===".slice((payload.length + 3) % 4);

    const binary =
      typeof atob === "function"
        ? atob(b64)
        : Buffer.from(b64, "base64").toString("binary");

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

async function getProviderIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  const jwt = store.get("admin_token")?.value ?? null;

  if (jwt) {
    const p = decodeJwtPayload<JwtClaims>(jwt) || {};
    const candidate =
      p.id ||
      p.sub ||
      p.providerId ||
      (p.user && (p.user.id || p.user._id)) ||
      null;

    if (candidate) return String(candidate);
  }

  return store.get("admin_uid")?.value ?? null;
}

export async function buildHeaders(req: NextRequest, withJson = false) {
  const providerId = await getProviderIdFromCookies();
  const headers = new Headers();

  headers.set("accept", "application/json");
  headers.set("cookie", req.headers.get("cookie") ?? "");

  if (providerId) headers.set("x-provider-id", providerId);
  if (withJson) headers.set("content-type", "application/json");

  return headers;
}
