
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // allowlist (keine Auth nötig)
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/signup') || 
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/logout' // <-- behalten
  ) {
    return NextResponse.next();
  }

  const hasToken = Boolean(req.cookies.get('admin_token')?.value);
  const needsAuth =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname === '/trainings';

  if (needsAuth && !hasToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/trainings'] };

