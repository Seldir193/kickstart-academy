export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  json,
  proxy,
  readJson,
  requireMe,
} from "@/app/api/admin/news/proxy.helpers";

export async function POST(req: NextRequest) {
  const auth = await requireMe(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const body = await readJson(req);
  const result = await proxy("/admin/news/translate", "POST", auth.me, body);

  return json(result.data, result.status);
}
