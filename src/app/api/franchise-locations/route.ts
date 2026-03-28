// src/app/api/franchise-locations/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getProviderIdFromCookies,
  getAdminTokenFromCookies,
} from "@/app/api/lib/auth";

function apiBase() {
  const b =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

// GET /api/franchise-locations → GET {BASE}/franchise-locations
export async function GET(_req: NextRequest) {
  const pid = await getProviderIdFromCookies();
  const token = await getAdminTokenFromCookies();

  if (!pid || !token) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const r = await fetch(`${apiBase()}/franchise-locations`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Provider-Id": pid,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}

// POST /api/franchise-locations → POST {BASE}/franchise-locations
export async function POST(req: NextRequest) {
  const pid = await getProviderIdFromCookies();
  const token = await getAdminTokenFromCookies();

  if (!pid || !token) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => ({}));

  const r = await fetch(`${apiBase()}/franchise-locations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Provider-Id": pid,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
