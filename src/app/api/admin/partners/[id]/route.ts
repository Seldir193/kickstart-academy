export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  json,
  proxy,
  readJson,
  requireSuper,
  toObject,
} from "@/app/api/admin/partners/proxy.helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = toObject(await readJson(req));
  const { id } = await ctx.params;
  const result = await proxy(`/admin/partners/${id}`, "PATCH", auth.me, body);

  return json(result.data, result.status);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const { id } = await ctx.params;
  const result = await proxy(`/admin/partners/${id}`, "DELETE", auth.me);

  return json(result.data, result.status);
}
