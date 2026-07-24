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

export async function POST(req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const { id } = await ctx.params;
  const qs = new URL(req.url).search;

  const r = await fetch(
    `${apiBase()}/bookings/${encodeURIComponent(id)}/approve-payment${qs}`,
    {
      method: "POST",
      headers: { "X-Provider-Id": pid },
      cache: "no-store",
    },
  );

  return passthroughUpstream(r);
}
