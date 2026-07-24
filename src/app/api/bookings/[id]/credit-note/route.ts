import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function backendBase() {
  return process.env.NEXT_BACKEND_API_BASE || "http://localhost:5000/api";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const cleanId = String(id || "").trim();
  const url = `${backendBase()}/admin/bookings/${encodeURIComponent(cleanId)}/credit-note.pdf`;

  const provider = req.headers.get("x-provider-id") || "";
  const r = await fetch(url, {
    headers: provider ? { "x-provider-id": provider } : {},
    cache: "no-store",
  });

  const buf = await r.arrayBuffer();
  return new NextResponse(buf, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/pdf",
    },
  });
}
