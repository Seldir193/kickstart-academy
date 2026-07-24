export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  json,
  normalizeFeedbackPayload,
  proxy,
  queryString,
  readJson,
  requireSuper,
} from "@/app/api/admin/feedbacks/proxy.helpers";

export async function GET(req: NextRequest) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const result = await proxy(
    `/admin/feedbacks${queryString(req)}`,
    "GET",
    auth.me,
  );

  return json(result.data, result.status);
}

export async function POST(req: NextRequest) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const payload = normalizeFeedbackPayload(await readJson(req));
  const result = await proxy("/admin/feedbacks", "POST", auth.me, payload);

  return json(result.data, result.status);
}
