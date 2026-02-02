/**
 * 보호 경로 설정
 * 로그인이 필요한 경로 프리픽스를 추가하세요.
 * 예: '/tesla/room' -> /tesla/room, /tesla/room/123 등 모두 보호됨
 */
export const protectedRoutes: string[] = [
  // '/tesla/room',
  // '/baby/room',
  // '/superpet',
];

/** 항상 접근 가능한 경로 (보호 경로에 포함되더라도 접근 가능) */
export const publicRoutes: string[] = [
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/health',
];

export const AUTH_COOKIE_NAME = 'auth-token';
export const JWT_EXPIRES_IN = '7d';
