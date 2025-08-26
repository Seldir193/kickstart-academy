// client/src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ADMIN_COOKIE_KEYS = ['admin_token', 'adminToken'];
const PUBLIC_ALLOW = new Set<string>([
  '/admin/login',
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
]);

function hasAdminCookie(req: NextRequest) {
  return ADMIN_COOKIE_KEYS.some((k) => Boolean(req.cookies.get(k)?.value));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // allowlisted auth routes pass through
  if ([...PUBLIC_ALLOW].some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // routes requiring admin
  const needsAuth =
    pathname === '/trainings' ||         // protect provider UI
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin');

  if (needsAuth && !hasAdminCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// match exactly the routes we want to protect
export const config = {
  matcher: ['/trainings', '/admin/:path*', '/api/admin/:path*'],
};










