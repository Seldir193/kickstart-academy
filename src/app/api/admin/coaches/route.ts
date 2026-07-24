export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  json,
  proxy,
  readJson,
  requireMe,
  roleHeader,
  toObject,
} from "@/app/api/admin/coaches/proxy.helpers";

function stripProviderCreateFields(body: unknown) {
  const next = toObject(body);

  delete next.providerId;

  delete next.status;
  delete next.published;
  delete next.rejectionReason;
  delete next.rejectedAt;

  delete next.submittedAt;
  delete next.approvedAt;
  delete next.liveUpdatedAt;

  delete next.hasDraft;
  delete next.draft;
  delete next.draftUpdatedAt;

  delete next.lastProviderEditAt;
  delete next.lastSuperEditAt;

  delete next.lastChangeSummary;
  delete next.lastChangeAt;

  return next;
}

function buildProviderCreatePayload(body: unknown) {
  const base = stripProviderCreateFields(body);
  return {
    ...base,
    status: "pending",
    published: false,
    rejectionReason: "",
    rejectedAt: null,
  };
}

function buildSuperCreatePayload(body: unknown) {
  return toObject(body);
}

export async function GET(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const url = new URL(req.url);
  const qs = url.searchParams.toString();

  const result = await proxy(
    `/admin/coaches${qs ? `?${qs}` : ""}`,
    "GET",
    auth.me,
  );
  return json(result.data, result.status);
}

export async function POST(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = await readJson(req);

  const payload =
    roleHeader(auth.me) === "provider"
      ? buildProviderCreatePayload(body)
      : buildSuperCreatePayload(body);

  const result = await proxy("/admin/coaches", "POST", auth.me, payload);
  return json(result.data, result.status);
}
