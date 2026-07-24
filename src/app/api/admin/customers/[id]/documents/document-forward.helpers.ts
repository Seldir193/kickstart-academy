import { NextResponse, type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

export type DocumentForwardCtx = {
  params: { id: string; bid: string };
};

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

export async function forwardBookingDocument(
  _req: NextRequest,
  { params }: DocumentForwardCtx,
  kind: string,
  fallbackFileName: string,
) {
  const pid = await getProviderIdFromCookies();
  if (!pid)
    return NextResponse.json(
      { ok: false, error: "Unauthorized: missing provider" },
      { status: 401 },
    );

  const url = `${apiBase()}/customers/${encodeURIComponent(params.id)}/bookings/${encodeURIComponent(params.bid)}/documents/${kind}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "x-provider-id": pid },
    cache: "no-store",
  });

  const body = Buffer.from(await r.arrayBuffer());
  return new NextResponse(body, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") || "application/pdf",
      "Content-Disposition":
        r.headers.get("content-disposition") ||
        `inline; filename="${fallbackFileName}"`,
    },
  });
}
