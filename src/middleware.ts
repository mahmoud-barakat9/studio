import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DUMMY_USER_ID = "5";
const DUMMY_ADMIN_ID = "4";

const PROTECTED_ROUTES = {
  USER: ['/dashboard', '/orders', '/notifications', '/profile'],
  ADMIN: ['/admin'],
};

function getUserFromCookie(req: NextRequest) {
    const userId = req.cookies.get('user_id')?.value;
    const userRole = req.cookies.get('user_role')?.value;

    if (userId && userRole) {
        return { id: userId, role: userRole };
    }
    return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getUserFromCookie(request);

  const isUserRoute = PROTECTED_ROUTES.USER.some(route => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith(PROTECTED_ROUTES.ADMIN[0]);
  
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static') || pathname.endsWith('.json') || pathname.endsWith('.ico') || pathname.endsWith('.png') || pathname.endsWith('.svg')) {
    return NextResponse.next();
  }

  // If user is not logged in
  if (!user) {
    if (isUserRoute || isAdminRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // If user is logged in
  if (user.role === 'admin') {
    // Admins can access user routes for testing purposes, but not login/register
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (user.role === 'user') {
    // If a regular user tries to access admin routes
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If a logged-in user tries to access login/register
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
