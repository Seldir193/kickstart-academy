


// client/src/app/api/public/bookings/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from "next/server";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

const ALLOWED_KEYS = [
  'offerId', 'firstName', 'lastName', 'email',
  'age','date', 'level', 'message',
] as const;
type Allowed = (typeof ALLOWED_KEYS)[number];

function sanitize(input: any) {
  const out: Record<string, any> = {};
  for (const k of ALLOWED_KEYS) {
    if (input[k] != null && input[k] !== '') {
      out[k] = k === 'age' ? Number(input[k]) : input[k];
    }
  }

  // ---- Compatibility aliases (in case backend expects other names) ----
  if (out.date && !out.bookingDate) out.bookingDate = out.date;
  if (Number.isFinite(out.age) && out.childAge == null) out.childAge = out.age;
  if (out.firstName && !out.first) out.first = out.firstName;
  if (out.lastName && !out.last) out.last = out.lastName;
  if (out.email && !out.mail) out.mail = out.email;

  // move extra fields to meta
  const meta: Record<string, any> = { ...input };
  ALLOWED_KEYS.forEach(k => delete meta[k]);
  Object.keys(meta).forEach(k => (meta[k] == null || meta[k] === '') && delete meta[k]);
  if (Object.keys(meta).length) out.meta = meta;

  return out;
}

export async function POST(req: NextRequest) {
  let raw: any;
  try {
    raw = await req.json();
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const body = sanitize(raw);

  try {
    const url = `${apiBase()}/bookings`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Forwarded-For": req.headers.get("x-forwarded-for") ?? "",
        "X-Real-IP": req.headers.get("x-real-ip") ?? "",
        "User-Agent": req.headers.get("user-agent") ?? "kickstart-academy/next-proxy",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await r.text();
    let payload: any;
    try { payload = JSON.parse(text); } catch { payload = { ok: r.ok, raw: text }; }

    // Dev-only logging (no PII dump; keys only)
    if (process.env.NODE_ENV !== 'production') {
      console.log("[/api/public/bookings] upstream", r.status, {
        sentKeys: Object.keys(body),
        hasMeta: !!body.meta,
        upstreamPayloadKeys: typeof payload === 'object' ? Object.keys(payload) : typeof payload,
      });
    }

    return NextResponse.json(payload, { status: r.status });
  }  
  catch (err: any) {
    console.error("[/api/public/bookings] upstream error:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Upstream fetch failed", detail: String(err?.message ?? err) },
      { status: 502 }
    );


  
  }
}

  
  
  












