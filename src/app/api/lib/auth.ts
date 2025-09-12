// app/api/lib/auth.ts

// app/api/lib/auth.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret');
import type { NextRequest } from 'next/server';


/** Aus Request (Header/Cookies/Query) oder – wenn nicht vorhanden – aus Server-Cookies/JWT */
export async function getProviderId(req?: NextRequest): Promise<string | null> {
  // 1) Header
  const hdr = req?.headers.get('x-provider-id');
  if (hdr && hdr.trim()) return hdr.trim();

  // 2) Cookies (Request-Kontext)
  const ckReq =
    req?.cookies.get('providerId')?.value ||
    req?.cookies.get('adminProviderId')?.value ||
    req?.cookies.get('aid')?.value;
  if (ckReq && String(ckReq).trim()) return String(ckReq).trim();

  // 3) Query
  const q = req?.nextUrl.searchParams.get('providerId');
  if (q && q.trim()) return q.trim();

  // 4) Server-Cookies (Route-Handler laufen serverseitig)
  try {
    const store = await cookies();
    const ck =
      store.get('providerId')?.value ||
      store.get('adminProviderId')?.value ||
      store.get('aid')?.value;
    if (ck && ck.trim()) return ck.trim();

    // 5) JWT (admin_token) → sub als providerId
    const token = store.get('admin_token')?.value;
    if (token) {
      const { payload } = await jwtVerify(token, secret);
      if (payload?.sub) return String(payload.sub);
    }
  } catch {
    // ignore
  }
  return null;
}











export async function signAdminToken(payload: { id: string; email: string; role: 'provider'|'super' }) {
  return await new SignJWT({ sub: payload.id, email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function getProviderIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  // 1) Bevorzugt aus JWT
  const token = store.get('admin_token')?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const sub = String(payload.sub || '');
      if (sub) return sub;
    } catch {}
  }
  // 2) Fallback: Klartext-Cookie
  const pid = store.get('providerId')?.value;
  return pid ? String(pid) : null;
}









