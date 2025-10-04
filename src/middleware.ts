// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PAGES = new Set([
  '/admin/login',
  '/admin/signup',
  '/admin/password-reset', // <- allow forgot page
  '/admin/new-password',   // <- allow new password page
]);

const PUBLIC_API = new Set([
  '/api/admin/auth/login',
  '/api/admin/auth/signup',
  '/api/admin/auth/logout',
  '/api/admin/auth/forgot', // <- allow send reset mail
  '/api/admin/auth/reset',  // <- allow apply new password
  '/api/ping',
  '/api/health',
]);

export function middleware(req: NextRequest) {
  const { pathname, searchParams, search } = req.nextUrl;

  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }

  if (pathname === '/book' && searchParams.get('embed') !== '1') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const token = req.cookies.get('admin_token')?.value;

  // --- API guard ---
  if (pathname.startsWith('/api/admin')) {
    if (PUBLIC_API.has(pathname)) return NextResponse.next();
    if (!token) {
      return new NextResponse(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.next();
  }

  // --- Page guard ---
  if (pathname.startsWith('/admin')) {
    if (PUBLIC_PAGES.has(pathname)) return NextResponse.next();
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname + (search || ''));
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/trainings' && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  if (pathname === '/customers') {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/customers';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/trainings', '/book', '/customers'],
};
