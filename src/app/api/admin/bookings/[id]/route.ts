export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";
import {
  apiBase,
  passthroughUpstream,
  unauthorizedResponse,
} from "@/app/api/admin/bookings/proxy.helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const { id } = await ctx.params;

  const r = await fetch(`${apiBase()}/bookings/${encodeURIComponent(id)}`, {
    headers: { "X-Provider-Id": pid, Accept: "application/json" },
    cache: "no-store",
  });

  return passthroughUpstream(r);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const { id } = await ctx.params;

  const r = await fetch(`${apiBase()}/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "X-Provider-Id": pid },
    cache: "no-store",
  });

  return passthroughUpstream(r);
}
