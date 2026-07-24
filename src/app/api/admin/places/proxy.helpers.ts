import { NextResponse } from "next/server";

export function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

export async function jsonPassthrough(r: Response) {
  const text = await r.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { ok: false, raw: text };
  }
  return NextResponse.json(data, { status: r.status });
}
