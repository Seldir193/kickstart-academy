export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";
import {
  apiBase,
  passthroughUpstream,
  unauthorizedResponse,
} from "@/app/api/admin/bookings/proxy.helpers";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const { id } = await ctx.params;

  const r = await fetch(
    `${apiBase()}/bookings/${encodeURIComponent(id)}/cancel-confirmed`,
    {
      method: "POST",
      headers: { "X-Provider-Id": pid, Accept: "application/json" },
      cache: "no-store",
    },
  );

  return passthroughUpstream(r);
}
