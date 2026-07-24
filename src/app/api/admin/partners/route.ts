export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  json,
  proxy,
  queryString,
  readJson,
  requireSuper,
  toObject,
} from "@/app/api/admin/partners/proxy.helpers";

export async function GET(req: NextRequest) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const result = await proxy(
    `/admin/partners${queryString(req)}`,
    "GET",
    auth.me,
  );

  return json(result.data, result.status);
}

export async function POST(req: NextRequest) {
  const auth = await requireSuper(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const payload = toObject(await readJson(req));
  const result = await proxy("/admin/partners", "POST", auth.me, payload);

  return json(result.data, result.status);
}
