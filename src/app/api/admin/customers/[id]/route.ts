export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

type Ctx = { params: Promise<{ id: string }> };

function customerUrl(id: string) {
  return `${apiBase()}/customers/${encodeURIComponent(id)}`;
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

export async function GET(_req: NextRequest, { params }: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const { id } = await params;

  const r = await fetch(customerUrl(id), {
    headers: { "X-Provider-Id": pid, Accept: "application/json" },
    cache: "no-store",
  });

  return passthrough(r);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const bodyIn = await req.json().catch(() => ({}));
  const { id } = await params;

  const r = await fetch(customerUrl(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Provider-Id": pid,
      Accept: "application/json",
    },
    body: JSON.stringify(bodyIn),
    cache: "no-store",
  });

  return passthrough(r);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const { id } = await params;

  const r = await fetch(customerUrl(id), {
    method: "DELETE",
    headers: { "X-Provider-Id": pid, Accept: "application/json" },
    cache: "no-store",
  });

  return passthrough(r);
}
