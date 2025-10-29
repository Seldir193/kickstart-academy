

// app/api/lib/auth.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

// Server-only Secret (in DEV Fallback)
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret');

/**
 * providerId aus Request (Header/Cookies/Query) oder – falls dort nicht vorhanden –
 * serverseitig aus HttpOnly-JWT (bevorzugt) bzw. Legacy-Klartext-Cookies.
 */
export async function getProviderId(req?: NextRequest): Promise<string | null> {
  // 1) Header
  const hdr = req?.headers.get('x-provider-id');
  if (hdr && hdr.trim()) return hdr.trim();

  // 2) Request-Cookies (lesbar) – nur als Legacy-Fallback
  const ckReq =
    req?.cookies.get('providerId')?.value ||
    req?.cookies.get('adminProviderId')?.value ||
    req?.cookies.get('aid')?.value;
  if (ckReq && String(ckReq).trim()) return String(ckReq).trim();

  // 3) Query
  const q = req?.nextUrl?.searchParams?.get('providerId');
  if (q && q.trim()) return q.trim();

  // 4) Serverseitig: erst JWT, dann Legacy-Klartext
  try {
    const store = await cookies(); // <-- async in deiner Version
    // 4a) JWT (admin_token) → sub als providerId (bevorzugt)
    const token = store.get('admin_token')?.value;
    if (token) {
      const { payload } = await jwtVerify(token, secret);
      const sub = String(payload.sub || '');
      if (sub) return sub;
    }

    // 4b) Legacy-Klartext-Cookies (Abwärtskompatibilität)
    const pid =
      store.get('providerId')?.value ||
      store.get('adminProviderId')?.value ||
      store.get('aid')?.value;
    if (pid && pid.trim()) return String(pid).trim();
  } catch {
    // ignore
  }

  return null;
}

/** Signiert ein Admin-JWT; providerId liegt in sub */
export async function signAdminToken(payload: { id: string; email: string; role: 'provider' | 'super' }) {
  return await new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(payload.id) // sub = providerId
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/** Serverseitig providerId primär aus HttpOnly-JWT ziehen, sonst Legacy-Fallback */
export async function getProviderIdFromCookies(): Promise<string | null> {
  const store = await cookies(); // <-- async

  // 1) JWT bevorzugt
  const token = store.get('admin_token')?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const sub = String(payload.sub || '');
      if (sub) return sub;
    } catch {
      // ignore
    }
  }

  // 2) Legacy-Klartext
  const pid = store.get('providerId')?.value;
  return pid ? String(pid) : null;
}





