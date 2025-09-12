


import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function nukeCookie(res: NextResponse, name: string, opts?: { httpOnly?: boolean; path?: string }) {
  // Host-/Pfad-agnostisch löschen
  res.cookies.delete(name);
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
  const res = new NextResponse(null, { status: 204 });

  // HttpOnly Token weg
  nukeCookie(res, 'admin_token', { httpOnly: true, path: '/' });

  // UI-Helfer weg (nicht HttpOnly)
  nukeCookie(res, 'admin_ui', { httpOnly: false, path: '/' });

  // WICHTIG: Provider-ID-Cookies wegräumen (nicht HttpOnly)
  nukeCookie(res, 'providerId', { httpOnly: false, path: '/' });
  // falls du diese Namen irgendwo benutzt hast:
  nukeCookie(res, 'adminProviderId', { httpOnly: false, path: '/' });
  nukeCookie(res, 'aid', { httpOnly: false, path: '/' });

  // Optional: sofort weiterleiten
  if (req.nextUrl.searchParams.get('redirect') === '1') {
    const to = new URL('/admin/login?next=/admin/bookings', req.url);
    return NextResponse.redirect(to, { headers: res.headers });
  }

  return res;
}

// Optional auch POST
export const POST = GET;










