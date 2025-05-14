import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('admin_authenticated');

  const isAdminLoginPage = pathname === '/admin/login';
  // Any path that starts with /admin, including /admin itself
  const isAccessingAdminArea = pathname.startsWith('/admin');

  // If trying to access a protected admin page (not the login page) and not authenticated
  if (isAccessingAdminArea && !isAdminLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If authenticated and trying to access the login page, redirect to /admin
  if (isAuthenticated && isAdminLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Configure the paths this middleware runs on
export const config = {
  // This matcher ensures the middleware runs for /admin, /admin/login, /admin/anythingelse
  matcher: ['/admin/:path*'],
}; 