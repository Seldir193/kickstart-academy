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

export function sanitizeOfferBody(body: unknown) {
  const next =
    body && typeof body === "object"
      ? { ...(body as Record<string, unknown>) }
      : {};
  const category = String(next.category || "").trim();
  const subType = String(next.sub_type || "").trim();
  const type = String(next.type || "").trim();

  const isPowertraining =
    category === "Holiday" &&
    (subType === "Powertraining" || type === "AthleticTraining");

  if (isPowertraining) next.days = [];
  return next;
}
