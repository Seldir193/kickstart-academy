
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret');

export async function signAdminToken(payload: { id: string; email: string; role: 'provider'|'super' }) {
  return await new SignJWT({ sub: payload.id, email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function getProviderIdFromCookies(): Promise<string | null> {
  const store = await cookies(); // ⬅️ wichtig
  const token = store.get('admin_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return String(payload.sub || '');
  } catch {
    return null;
  }
}
