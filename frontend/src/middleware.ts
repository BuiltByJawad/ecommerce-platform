import { NextResponse, type NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from './types/types';

const publicRoutes: string[] = [
  '/home',
  '/signin',
  '/signup',
  '/signup/activation',
  '/business/login',
  '/cart',
  '/payment',
  '/payment/success',
  '/payment/cancel',
  '/payment/fail',
  '/search',
];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow product routes publicly
  if (pathname.startsWith('/products')) {
    return NextResponse.next();
  }

  // Allow vendor listing and vendor store publicly
  if (pathname.startsWith('/vendors')) {
    return NextResponse.next();
  }

  // Allow password reset/forgot publicly
  if (pathname.startsWith('/reset-password') || pathname.startsWith('/forgot-password')) {
    return NextResponse.next();
  }

  // Allow exact public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('refresh_token');
  if (!tokenCookie) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(tokenCookie.value);
    const userRole: string = decodedToken.userRole;
    const userVerified: boolean = decodedToken.userVerified;

    // Email verification gate for authenticated users
    if (!userVerified && pathname !== '/signup/activation' && pathname !== '/signin') {
      return NextResponse.redirect(new URL('/signup/activation', request.url));
    }

    // Role-based gates for admin-only areas
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
