








// Lauf sicher in Node (Buffer verfügbar) & ohne Cache
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';

function clean(v: unknown) {
  return String(v ?? '').trim().replace(/^['"]|['"]$/g, '');
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Cookie-Check (nur eingeloggte Admins)
  const token = req.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // ENV lesen (mit DEV-Fallback)
  const apiBase = clean(process.env.NEXT_BACKEND_API_BASE) || 'http://127.0.0.1:5000/api';
  const isDev = process.env.NODE_ENV !== 'production';
  const adminEmail = clean(process.env.ADMIN_EMAIL || (isDev ? 'admin@example.com' : ''));
  const adminPass  = clean(process.env.ADMIN_PASSWORD || (isDev ? 'supergeheim' : ''));

  if (!adminEmail || !adminPass) {
    return NextResponse.json({ ok: false, error: 'Admin credentials missing' }, { status: 500 });
  }

  // Basic-Auth zum Backend
  const basic = Buffer.from(`${adminEmail}:${adminPass}`).toString('base64');

  // An Backend weiterleiten
  const r = await fetch(`${apiBase}/bookings/${params.id}/confirm`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}` },
    cache: 'no-store',
  });

  const text = await r.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return NextResponse.json(data, { status: r.status });
}





