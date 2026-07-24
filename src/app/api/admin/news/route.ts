export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  json,
  proxy,
  queryString,
  readJson,
  requireMe,
  roleHeader,
  type Me,
} from "@/app/api/admin/news/proxy.helpers";
import {
  normalizeNewsImages,
  stripProviderFields,
} from "@/app/api/admin/news/payload.helpers";

function buildProviderCreatePayload(body: unknown) {
  const base = stripProviderFields(body);
  return { ...base, published: false, rejectionReason: "", rejectedAt: null };
}

function buildCreatePayload(me: Me, body: unknown) {
  if (roleHeader(me) === "provider") {
    return buildProviderCreatePayload(body);
  }

  return normalizeNewsImages(body);
}

export async function GET(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const result = await proxy(`/admin/news${queryString(req)}`, "GET", auth.me);
  return json(result.data, result.status);
}

export async function POST(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = await readJson(req);
  const payload = buildCreatePayload(auth.me, body);
  const result = await proxy("/admin/news", "POST", auth.me, payload);

  return json(result.data, result.status);
}
