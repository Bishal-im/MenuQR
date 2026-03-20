import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;
  
  // Get the subdomain (e.g., admin.localhost:3000 -> admin)
  const subdomain = host.split('.')[0];
  
  // Only handle specific subdomains for rewriting
  const isSuperAdminSubdomain = subdomain === 'superadmin';
  const isAdminSubdomain = subdomain === 'admin';
  const isWaiterSubdomain = subdomain === 'waiter';

  // 1. Rewrite based on subdomain
  if (isSuperAdminSubdomain && !pathname.startsWith('/superadmin')) {
    url.pathname = `/superadmin${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isAdminSubdomain && !pathname.startsWith('/admin')) {
    url.pathname = `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isWaiterSubdomain && !pathname.startsWith('/waiter')) {
    url.pathname = `/waiter${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Role-based Protection (Server-side)
  // Check if accessing a protected route
  const isSuperAdminRoute = pathname.startsWith('/superadmin');
  const isAdminRoute = pathname.startsWith('/admin');
  const isWaiterRoute = pathname.startsWith('/waiter');

  // Skip protection for login/register/auth related pages
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/api/auth');

  if (!isAuthPage) {
    if (isSuperAdminRoute) {
      const session = request.cookies.get('menu_qr_superadmin_session');
      if (!session) {
        return NextResponse.redirect(new URL('/superadmin/login', request.url));
      }
    }

    if (isAdminRoute) {
      const session = request.cookies.get('menu_qr_admin_session');
      if (!session) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    if (isWaiterRoute) {
      const session = request.cookies.get('menu_qr_waiter_session');
      if (!session) {
        return NextResponse.redirect(new URL('/waiter/login', request.url));
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
