import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  
  // Get the subdomain (e.g., admin.localhost:3000 -> admin)
  const subdomain = host.split('.')[0];
  
  // Only handle specific subdomains and avoid infinite loops
  const isSuperAdminSubdomain = subdomain === 'superadmin';
  const isAdminSubdomain = subdomain === 'admin';
  const isWaiterSubdomain = subdomain === 'waiter';

  if (isSuperAdminSubdomain && !url.pathname.startsWith('/superadmin')) {
    url.pathname = `/superadmin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isAdminSubdomain && !url.pathname.startsWith('/admin')) {
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isWaiterSubdomain && !url.pathname.startsWith('/waiter')) {
    url.pathname = `/waiter${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Handle cross-panel access for non-subdomain requests if needed, 
  // or just let them pass through.
  
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
