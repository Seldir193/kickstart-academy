export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  json,
  proxy,
  readJson,
  requireMe,
  roleHeader,
  type Me,
} from "@/app/api/admin/news/proxy.helpers";
import {
  hasOwn,
  normalizeNewsImages,
  stripProviderFields,
} from "@/app/api/admin/news/payload.helpers";

type Ctx = { params: Promise<{ id: string }> };

function buildProviderPayload(body: unknown) {
  const obj = normalizeNewsImages(body);

  if (obj.submitForReview === true) {
    const base = stripProviderFields(obj);
    return { ...base, submitForReview: true };
  }

  if (hasOwn(obj, "published")) {
    return { published: Boolean(obj.published) };
  }

  return stripProviderFields(obj);
}

function buildSuperPayload(body: unknown) {
  const next = normalizeNewsImages(body);
  delete next.submitForReview;

  return next;
}

function buildPatchPayload(me: Me, body: unknown) {
  if (roleHeader(me) === "provider") {
    return buildProviderPayload(body);
  }

  return buildSuperPayload(body);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);

  if (!auth.ok) {
    return json({ ok: false, error: auth.error }, auth.status);
  }

  const body = await readJson(req);
  const { id } = await ctx.params;
  const payload = buildPatchPayload(auth.me, body);
  const result = await proxy(`/admin/news/${id}`, "PATCH", auth.me, payload);

  return json(result.data, result.status);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);

  if (!auth.ok) {
    return json({ ok: false, error: auth.error }, auth.status);
  }

  const { id } = await ctx.params;
  const result = await proxy(`/admin/news/${id}`, "DELETE", auth.me);

  return json(result.data, result.status);
}
