import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, LOGIN_ROUTE } from '@/lib/constants';

export function proxy(request: NextRequest) {
  if (!request.cookies.has(AUTH_COOKIE_NAME)) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/users/:path*', '/roles/:path*'],
};
