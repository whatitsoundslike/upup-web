import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, JWT_EXPIRES_IN } from '@/config/auth';

export interface JwtPayload {
  sub: string;
  uid: string;
  email: string | null;
  name: string | null;
  [key: string]: unknown;
}

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
