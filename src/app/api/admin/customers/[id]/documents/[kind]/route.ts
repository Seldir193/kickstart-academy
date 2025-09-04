export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProviderIdFromCookies } from '@/app/api/lib/auth';

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api';
  return b.replace(/\/+$/, '');
}

async function forwardToBackendAsPost(
  req: NextRequest,
  params: { id: string; bid: string; kind: string }
) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json({ ok: false, error: 'Unauthorized: missing provider' }, { status: 401 });
  }

  // evtl. Body aus POST (json oder form) oder Query (GET → amount/currency etc.)
  let body: any = {};
  try {
    if (req.method === 'POST') {
      const ctype = req.headers.get('content-type') || '';
      if (ctype.includes('application/json')) {
        body = await req.json().catch(() => ({}));
      } else if (ctype.includes('application/x-www-form-urlencoded') || ctype.includes('multipart/form-data')) {
        const fd = await req.formData();
        body = Object.fromEntries(fd.entries());
      }
    } else {
      // GET: optionale Parameter aus Query übernehmen (z. B. amount, currency)
      const sp = req.nextUrl.searchParams;
      for (const k of sp.keys()) body[k] = sp.get(k);
    }
  } catch {
    body = {};
  }

  const url =
    `${apiBase()}/customers/${encodeURIComponent(params.id)}` +
    `/bookings/${encodeURIComponent(params.bid)}/documents/${encodeURIComponent(params.kind)}`;

  const r = await fetch(url, {
    method: 'POST',                      // immer als POST ins Backend
    headers: {
      'Content-Type': 'application/json',
      'x-provider-id': pid,
    },
    cache: 'no-store',
    body: JSON.stringify(body || {}),
  });

  const buf = await r.arrayBuffer();
  return new NextResponse(buf, {
    status: r.status,
    headers: {
      'Content-Type': r.headers.get('content-type') || 'application/pdf',
      'Content-Disposition':
        r.headers.get('content-disposition') ||
        `inline; filename="${params.kind}.pdf"`,
    },
  });
}

// GET → an Backend-POST weiterleiten (für „im neuen Tab öffnen“)
export async function GET(req: NextRequest, ctx: { params: { id: string; bid: string; kind: string } }) {
  return forwardToBackendAsPost(req, ctx.params);
}

// POST → ebenfalls weiterleiten (falls du irgendwo per POST öffnest)
export async function POST(req: NextRequest, ctx: { params: { id: string; bid: string; kind: string } }) {
  return forwardToBackendAsPost(req, ctx.params);
}
