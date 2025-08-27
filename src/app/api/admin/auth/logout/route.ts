import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function nukeCookie(res: NextResponse, name: string, opts?: { httpOnly?: boolean; path?: string }) {
  // 1) einfache Delete-API (host-only, path='/')
  res.cookies.delete(name);
  // 2) explizit mit Attributen + Ablauf
  res.cookies.set(name, '', {
    httpOnly: opts?.httpOnly ?? true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: opts?.path ?? '/',
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function GET(req: NextRequest) {
  // Cookies löschen
  const res = new NextResponse(null, { status: 204 });
  nukeCookie(res, 'admin_token', { httpOnly: true, path: '/' });
  // falls vorhanden: UI-Helfer (nicht HttpOnly)
  nukeCookie(res, 'admin_ui', { httpOnly: false, path: '/' });

  // Wenn ?redirect=1 -> direkt weiterleiten (inkl. Set-Cookie in DIESER Response)
  if (req.nextUrl.searchParams.get('redirect') === '1') {
    const to = new URL('/admin/login?next=/admin/bookings', req.url);
    return NextResponse.redirect(to, { headers: res.headers });
  }
  return res;
}



// Optional POST auch erlauben
export const POST = GET;


