export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  json,
  proxy,
  readJson,
  requireMe,
  roleHeader,
  type Me,
} from "@/app/api/admin/franchise-locations/proxy.helpers";
import {
  hasOwn,
  stripProviderFields,
  toBool,
  toObject,
} from "@/app/api/admin/franchise-locations/payload.helpers";

type Ctx = { params: Promise<{ id: string }> };

function buildProviderPayload(body: unknown) {
  const obj = toObject(body);

  if (obj.submitForReview === true) {
    const base = stripProviderFields(obj);
    return { ...base, submitForReview: true };
  }

  if (hasOwn(obj, "published")) {
    return { published: toBool(obj.published) };
  }

  return stripProviderFields(obj);
}

function buildPatchPayload(me: Me, body: unknown) {
  return roleHeader(me) === "provider"
    ? buildProviderPayload(body)
    : toObject(body);
}

function locationPath(id: string) {
  return `/admin/franchise-locations/${encodeURIComponent(id)}`;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = await readJson(req);
  const { id } = await ctx.params;
  const payload = buildPatchPayload(auth.me, body);

  const result = await proxy(locationPath(id), "PATCH", auth.me, payload);
  return json(result.data, result.status);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  return PATCH(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const { id } = await ctx.params;
  const result = await proxy(locationPath(id), "DELETE", auth.me);

  return json(result.data, result.status);
}
