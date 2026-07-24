import { getProviderIdFromCookies } from "@/app/api/lib/auth";
import {
  apiBase,
  jsonPassthrough,
  sanitizeOfferBody,
  unauthorizedResponse,
} from "@/app/api/admin/offers/proxy.helpers";

export async function GET(req: Request) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const qs = new URL(req.url).search;
  const r = await fetch(`${apiBase()}/offers${qs}`, {
    headers: { "X-Provider-Id": pid },
    cache: "no-store",
  });

  return jsonPassthrough(r);
}

export async function POST(req: Request) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const rawBody = await req.json().catch(() => ({}));
  const body = sanitizeOfferBody(rawBody);

  const r = await fetch(`${apiBase()}/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Provider-Id": pid,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return jsonPassthrough(r);
}
