export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  json,
  proxy,
  queryString,
  readJson,
  requireMe,
  roleHeader,
} from "@/app/api/admin/franchise-locations/proxy.helpers";
import {
  stripProviderFields,
  toObject,
} from "@/app/api/admin/franchise-locations/payload.helpers";

export async function GET(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const result = await proxy(
    `/admin/franchise-locations${queryString(req)}`,
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
      ? stripProviderFields(body)
      : toObject(body);

  const result = await proxy(
    "/admin/franchise-locations",
    "POST",
    auth.me,
    payload,
  );
  return json(result.data, result.status);
}
