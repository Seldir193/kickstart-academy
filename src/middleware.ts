// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PAGES = new Set(['/admin/login', '/admin/signup']);
const PUBLIC_API = new Set([
  '/api/admin/auth/login',
  '/api/admin/auth/signup',   // <-- WICHTIG: freigeben!
  '/api/admin/auth/logout',
  '/api/ping',
  '/api/health',
]);

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Statische Assets und Next intern immer durchlassen
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_token')?.value;

  // -------- API GUARD --------
  if (pathname.startsWith('/api/admin')) {
    // öffentliche Admin-APIs (Login/Signup/Logout/Health)
    if (PUBLIC_API.has(pathname)) return NextResponse.next();

    // alle anderen /api/admin/* brauchen Token -> JSON 401 (kein HTML-Redirect!)
    if (!token) {
      return new NextResponse(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.next();
  }

  // -------- PAGE GUARD --------
  if (pathname.startsWith('/admin')) {
    // öffentliche Admin-Seiten
    if (PUBLIC_PAGES.has(pathname)) return NextResponse.next();

    // übrige Admin-Seiten -> Redirect auf Login, wenn kein Token
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname + (search || ''));
      return NextResponse.redirect(url);
    }
  }

  // optionaler Schutz für /trainings als Seite
  if (pathname === '/trainings' && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/trainings'] };













