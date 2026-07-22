import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { AccessKey } from '@/lib/adapter';

const COOKIE_NAME = 'mcg_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'AUTH_SECRET is not set. Add it in your Vercel project environment variables before deploying.'
      );
    }
    console.warn('[mycocktailguide] AUTH_SECRET not set — using an insecure dev-only fallback.');
    return new TextEncoder().encode('dev-only-insecure-secret-change-me');
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  keyId: string;
  role: AccessKey['role'];
  permissions: string[];
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      keyId: payload.keyId as string,
      role: payload.role as SessionPayload['role'],
      permissions: payload.permissions as string[],
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

/** Reads and verifies the session from the incoming request's cookies. Use in Route Handlers. */
export async function getServerSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Throws-free permission check for use inside API route handlers. */
export async function requirePermission(permission: string): Promise<
  { ok: true; session: SessionPayload } | { ok: false; status: number; message: string }
> {
  const session = await getServerSession();
  if (!session) return { ok: false, status: 401, message: 'Not authenticated.' };
  if (!session.permissions.includes(permission)) {
    return { ok: false, status: 403, message: `Missing permission: ${permission}` };
  }
  return { ok: true, session };
}
