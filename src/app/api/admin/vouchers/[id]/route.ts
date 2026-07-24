export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  apiBase,
  buildHeaders,
  safeJson,
} from "@/app/api/admin/vouchers/proxy.helpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Params) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const r = await fetch(`${apiBase()}/vouchers/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: await buildHeaders(req, true),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await r.text();
    const data = safeJson(text);

    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    console.error(
      "[PATCH /api/admin/vouchers/[id]] error:",
      err?.message || err,
    );
    return NextResponse.json(
      {
        ok: false,
        error: "Server error in PATCH /api/admin/vouchers/[id]",
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, ctx: Params) {
  try {
    const { id } = await ctx.params;

    const r = await fetch(`${apiBase()}/vouchers/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: await buildHeaders(req),
      cache: "no-store",
    });

    const text = await r.text();
    const data = safeJson(text);

    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    console.error(
      "[DELETE /api/admin/vouchers/[id]] error:",
      err?.message || err,
    );
    return NextResponse.json(
      {
        ok: false,
        error: "Server error in DELETE /api/admin/vouchers/[id]",
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}
