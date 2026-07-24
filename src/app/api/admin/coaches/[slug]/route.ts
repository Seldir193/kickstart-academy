export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  hasOwn,
  json,
  proxy,
  readJson,
  requireMe,
  roleHeader,
  toObject,
  type Me,
} from "@/app/api/admin/coaches/proxy.helpers";

type Ctx = { params: Promise<{ slug: string }> };

function stripProviderFields(body: unknown) {
  const next = toObject(body);

  delete next.submitForReview;

  delete next.providerId;

  delete next.status;
  delete next.rejectionReason;
  delete next.rejectedAt;

  delete next.approvedAt;
  delete next.liveUpdatedAt;
  delete next.submittedAt;

  delete next.hasDraft;
  delete next.draft;
  delete next.draftUpdatedAt;

  delete next.lastProviderEditAt;
  delete next.lastSuperEditAt;

  delete next.lastChangeSummary;
  delete next.lastChangeAt;

  return next;
}

function buildProviderPayload(body: unknown) {
  const obj = toObject(body);

  if (obj.submitForReview === true) {
    return { submitForReview: true };
  }

  if (hasOwn(obj, "published")) {
    return { published: Boolean(obj.published) };
  }

  return stripProviderFields(obj);
}

function buildSuperPayload(body: unknown) {
  const next = toObject(body);
  delete next.submitForReview;
  return next;
}

function coachPath(slug: string) {
  return `/admin/coaches/${encodeURIComponent(slug)}`;
}

function buildPatchPayload(me: Me, body: unknown) {
  return roleHeader(me) === "provider"
    ? buildProviderPayload(body)
    : buildSuperPayload(body);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const { slug } = await ctx.params;
  const body = await readJson(req);
  const payload = buildPatchPayload(auth.me, body);

  const result = await proxy(coachPath(slug), "PATCH", auth.me, payload);
  return json(result.data, result.status);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const { slug } = await ctx.params;
  const result = await proxy(coachPath(slug), "DELETE", auth.me);

  return json(result.data, result.status);
}
