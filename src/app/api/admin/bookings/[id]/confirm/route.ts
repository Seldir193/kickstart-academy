export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";
import {
  apiBase,
  passthroughUpstream,
  unauthorizedResponse,
} from "@/app/api/admin/bookings/proxy.helpers";

type Ctx = {
  params: Promise<{ id: string }>;
};

function confirmQueryString(req: NextRequest) {
  const resend = req.nextUrl.searchParams.get("resend") === "1";
  const manual = req.nextUrl.searchParams.get("manual") === "1";

  const params = new URLSearchParams();
  if (resend) params.set("resend", "1");
  if (manual) params.set("manual", "1");

  return params.toString() ? `?${params.toString()}` : "";
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const { id } = await ctx.params;
  const qs = confirmQueryString(req);

  const r = await fetch(
    `${apiBase()}/bookings/${encodeURIComponent(id)}/confirm${qs}`,
    {
      method: "POST",
      headers: { "X-Provider-Id": pid, Accept: "application/json" },
      cache: "no-store",
    },
  );

  return passthroughUpstream(r);
}
