// /src/app/api/coaches/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE = (process.env.NEXT_BACKEND_API_BASE || "").replace(/\/+$/, "");

function cors(res: NextResponse) {
  // WP-Frontend läuft lokal auf http://localhost
  res.headers.set("Access-Control-Allow-Origin", "http://localhost");
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const { slug } = await params;

  const upstream = await fetch(`${BASE}/coaches/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const body = await upstream.text();
  return cors(
    new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    })
  );
}
