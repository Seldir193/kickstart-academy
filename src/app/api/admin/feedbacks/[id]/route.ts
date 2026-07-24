export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  json,
  normalizeFeedbackPayload,
  proxy,
  readJson,
  requireSuper,
} from "@/app/api/admin/feedbacks/proxy.helpers";

type Ctx = { params: Promise<{ id: string }> };

async function feedbackPath(ctx: Ctx) {
  const { id } = await ctx.params;
  return `/admin/feedbacks/${encodeURIComponent(id)}`;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const payload = normalizeFeedbackPayload(await readJson(req));
  const result = await proxy(
    await feedbackPath(ctx),
    "PATCH",
    auth.me,
    payload,
  );

  return json(result.data, result.status);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const result = await proxy(await feedbackPath(ctx), "DELETE", auth.me);

  return json(result.data, result.status);
}
