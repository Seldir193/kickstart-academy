











// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PAGES = new Set(['/admin/login', '/admin/signup']);
const PUBLIC_API = new Set([
  '/api/admin/auth/login',
  '/api/admin/auth/signup',
  '/api/admin/auth/logout',
  '/api/ping',
  '/api/health',
]);

export function middleware(req: NextRequest) {
  const { pathname, searchParams, search } = req.nextUrl;

  // Allow static/Next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // 🚫 Block standalone /book — only allow when embed=1
  if (pathname === '/book' && searchParams.get('embed') !== '1') {
    const url = req.nextUrl.clone();
    url.pathname = '/';            // or '/trainings' if you prefer
    url.search = '';
    return NextResponse.redirect(url);
  }

  const token = req.cookies.get('admin_token')?.value;

  // -------- API GUARD --------
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

  // -------- PAGE GUARD --------
  if (pathname.startsWith('/admin')) {
    if (PUBLIC_PAGES.has(pathname)) return NextResponse.next();
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname + (search || ''));
      return NextResponse.redirect(url);
    }
  }

  // Optional guard for /trainings
  if (pathname === '/trainings' && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }


// optional: /customers -> /admin/customers
if (pathname === '/customers') {
  const url = req.nextUrl.clone();
  url.pathname = '/admin/customers';
  return NextResponse.redirect(url);
}

  return NextResponse.next();
}

// Add '/book' to the matcher
//export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/trainings', '/book'] };

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/trainings', '/book', '/customers'] };
