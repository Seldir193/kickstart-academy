
// middleware.ts (im client-Root)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (
    pathname.startsWith('/admin/login') ||
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/logout')
   {
    return NextResponse.next();
  }

  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const hasToken  = Boolean(req.cookies.get('admin_token')?.value);

  if (needsAuth && !hasToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };


