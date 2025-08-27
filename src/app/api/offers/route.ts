export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

export async function GET(req: Request) {
  const qs = new URL(req.url).search; // ?q=…&type=…&location=…&page=…&limit=…
  const r  = await fetch(`${apiBase()}/offers${qs}`, { cache: 'no-store' });
  const text = await r.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { ok: r.ok, raw: text }; }
  return NextResponse.json(data, { status: r.status });
}
