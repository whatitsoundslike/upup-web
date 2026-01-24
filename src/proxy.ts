import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Only intercept API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const isApiEnabled = process.env.API_ENABLED !== 'false';

        if (!isApiEnabled) {
            return NextResponse.json(
                { error: 'API is currently disabled' },
                { status: 503 }
            );
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/api/:path*',
};
