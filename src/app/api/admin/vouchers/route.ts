export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  apiBase,
  buildHeaders,
  safeJson,
} from "@/app/api/admin/vouchers/proxy.helpers";

type VoucherRecord = { code?: unknown; active?: unknown };

function filterItems(items: VoucherRecord[], q: string, status: string) {
  let list = Array.isArray(items) ? items : [];
  const needle = String(q || "")
    .trim()
    .toLowerCase();

  if (needle) {
    list = list.filter((item) =>
      String(item?.code || "")
        .toLowerCase()
        .includes(needle),
    );
  }

  if (status === "active") {
    list = list.filter((item) => item?.active === true);
  }

  if (status === "inactive") {
    list = list.filter((item) => item?.active === false);
  }

  return list;
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const status = (
      req.nextUrl.searchParams.get("status") || "all"
    ).toLowerCase();

    const r = await fetch(`${apiBase()}/vouchers`, {
      method: "GET",
      headers: await buildHeaders(req),
      cache: "no-store",
    });

    const text = await r.text();
    const data = safeJson(text);

    if (!r.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.error || `Upstream vouchers failed (${r.status})`,
          detail: data,
        },
        { status: r.status },
      );
    }

    const items = Array.isArray(data?.vouchers) ? data.vouchers : [];
    const vouchers = filterItems(items, q, status);

    return NextResponse.json({ ok: true, vouchers }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/admin/vouchers] error:", err?.message || err);
    return NextResponse.json(
      {
        ok: false,
        error: "Server error in /api/admin/vouchers",
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log("[POST /api/admin/vouchers] body", body);

    const r = await fetch(`${apiBase()}/vouchers`, {
      method: "POST",
      headers: await buildHeaders(req, true),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await r.text();
    const data = safeJson(text);

    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    console.error("[POST /api/admin/vouchers] error:", err?.message || err);
    return NextResponse.json(
      {
        ok: false,
        error: "Server error in POST /api/admin/vouchers",
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}
