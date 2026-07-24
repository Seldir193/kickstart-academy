import { getProviderIdFromCookies } from "@/app/api/lib/auth";
import {
  apiBase,
  jsonPassthrough,
  unauthorizedResponse,
} from "@/app/api/admin/places/proxy.helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const { id } = await params;

  const r = await fetch(`${apiBase()}/places/${id}`, {
    headers: { "X-Provider-Id": pid },
    cache: "no-store",
  });

  return jsonPassthrough(r);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const body = await req.json().catch(() => ({}));
  const { id } = await params;

  const r = await fetch(`${apiBase()}/places/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Provider-Id": pid,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return jsonPassthrough(r);
}

export async function PUT(req: Request, ctx: Ctx) {
  return PATCH(req, ctx);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const pid = await getProviderIdFromCookies();
  if (!pid) return unauthorizedResponse();

  const { id } = await params;

  const r = await fetch(`${apiBase()}/places/${id}`, {
    method: "DELETE",
    headers: { "X-Provider-Id": pid },
    cache: "no-store",
  });

  return jsonPassthrough(r);
}
