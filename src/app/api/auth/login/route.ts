import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/adapter';
import { createSessionToken, setSessionCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== 'string' || password.length === 0) {
    return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
  }

  const key = await verifyPassword(password);
  if (!key) {
    return NextResponse.json({ error: 'Invalid key.' }, { status: 401 });
  }

  const token = await createSessionToken({
    keyId: key.id,
    role: key.role,
    permissions: key.permissions,
  });
  setSessionCookie(token);

  return NextResponse.json({
    role: key.role,
    permissions: key.permissions,
    label: key.label,
  });
}
