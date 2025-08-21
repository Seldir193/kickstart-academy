// client/src/app/api/debug/cookies/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value || null;
  return NextResponse.json({ admin_token: token });
}
