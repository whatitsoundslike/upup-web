import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { protectedRoutes, publicRoutes, AUTH_COOKIE_NAME } from '@/config/auth';

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API proxy: check API_ENABLED
  if (pathname.startsWith('/api')) {
    const isApiEnabled = process.env.API_ENABLED !== 'false';
    if (!isApiEnabled) {
      return NextResponse.json(
        { error: 'API is currently disabled' },
        { status: 503 }
      );
    }
  }

  // Skip public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if current path matches any protected route prefix
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Verify authentication
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og_image|room-icon).*)',
  ],
};
