import { NextRequest, NextResponse } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return raw.replace(/\/$/, "");
}

function missingBaseResponse() {
  console.error("[customers-proxy] NEXT_BACKEND_API_BASE missing");
  return NextResponse.json(
    { ok: false, error: "NEXT_BACKEND_API_BASE missing" },
    { status: 500 },
  );
}

function unauthorizedResponse() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

async function passthrough(r: Response) {
  const body = await r.text();
  return new NextResponse(body, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}

export async function GET(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) return missingBaseResponse();

  const providerId = await getProviderIdFromCookies();
  if (!providerId) return unauthorizedResponse();

  const qs = req.nextUrl.searchParams.toString();
  const url = `${BASE}/customers${qs ? `?${qs}` : ""}`;

  try {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-provider-id": providerId,
      },
      cache: "no-store",
    });

    return await passthrough(r);
  } catch (e: any) {
    console.error("[customers-proxy] error:", e?.message || e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Proxy error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) return missingBaseResponse();

  const providerId = await getProviderIdFromCookies();
  if (!providerId) return unauthorizedResponse();

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {}

  try {
    const r = await fetch(`${BASE}/customers`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Accept: "application/json",
        "x-provider-id": providerId,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    return await passthrough(r);
  } catch (e: any) {
    console.error("[customers-proxy:POST] error:", e?.message || e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Proxy error" },
      { status: 500 },
    );
  }
}
