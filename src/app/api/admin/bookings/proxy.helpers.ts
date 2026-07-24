import { NextResponse } from "next/server";

export function apiBase() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api";
  return raw.replace(/\/+$/, "");
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

export async function passthroughUpstream(r: Response) {
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
