import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

function apiBase() {
  const base = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return base.replace(/\/+$/, "");
}

function getSearch(req: Request) {
  return new URL(req.url).search || "";
}

function assertEnv(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`${name} is missing`);
  return v;
}

function providerIdFromToken(token: string): string | null {
  try {
    const secret = assertEnv("AUTH_SECRET");
    const payload = jwt.verify(token, secret) as any;
    const pid = String(payload?.id || payload?.providerId || "").trim();
    return pid || null;
  } catch {
    return null;
  }
}

async function resolveProviderId(req: Request): Promise<string | null> {
  try {
    const store = await cookies();
    const hdrs = await headers();
    const url = new URL(req.url);

    const token = store.get("admin_token")?.value;
    if (token) {
      const pid = providerIdFromToken(token);
      if (pid) return pid;
    }

    const pidCookie =
      store.get("admin_uid")?.value || store.get("providerId")?.value;
    if (pidCookie && String(pidCookie).trim()) return String(pidCookie).trim();

    const pidHeader = hdrs.get("x-provider-id");
    if (pidHeader && pidHeader.trim()) return pidHeader.trim();

    const pidQuery = url.searchParams.get("providerId");
    if (pidQuery && pidQuery.trim()) return pidQuery.trim();

    return null;
  } catch {
    return null;
  }
}

function jsonOrTextResponse(text: string, r: Response) {
  try {
    const data = JSON.parse(text);
    return NextResponse.json(data, { status: r.status });
  } catch {
    return new NextResponse(text, {
      status: r.status,
      headers: {
        "Content-Type": r.headers.get("Content-Type") || "text/plain",
      },
    });
  }
}

export async function proxyRevenueRequest(
  req: Request,
  upstreamPath: string,
  errorLabel: string,
) {
  try {
    const providerId = await resolveProviderId(req);
    if (!providerId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const upstream = `${apiBase()}${upstreamPath}${getSearch(req)}`;
    const r = await fetch(upstream, {
      headers: { "x-provider-id": providerId },
      cache: "no-store",
    });

    const text = await r.text();
    return jsonOrTextResponse(text, r);
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: errorLabel,
        detail: String(e?.message || e),
      },
      { status: 500 },
    );
  }
}
