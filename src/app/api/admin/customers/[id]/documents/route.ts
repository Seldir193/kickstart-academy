// //src\app\api\admin\customers\[id]\documents\route.ts
// app/api/admin/customers/[id]/documents/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const pid = await getProviderIdFromCookies();

    if (!pid) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: missing provider" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const qs = req.nextUrl.searchParams.toString();
    const url = `${apiBase()}/customers/${encodeURIComponent(id)}/documents${
      qs ? `?${qs}` : ""
    }`;

    const upstream = await fetch(url, {
      method: "GET",
      headers: { "X-Provider-Id": pid },
      cache: "no-store",
    });

    const text = await upstream.text().catch(() => "");

    if (!upstream.ok) {
      let detail: unknown = text;

      try {
        detail = JSON.parse(text);
      } catch {}

      return NextResponse.json(
        {
          ok: false,
          status: upstream.status,
          error: "Upstream failed",
          detail,
        },
        { status: upstream.status },
      );
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, {
        status: upstream.status,
        headers: { "Cache-Control": "no-store" },
      });
    } catch {
      return new NextResponse(text, {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);

    return NextResponse.json(
      { ok: false, error: "Proxy failed", detail: msg },
      { status: 500 },
    );
  }
}

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextResponse, type NextRequest } from "next/server";
// import { getProviderIdFromCookies } from "@/app/api/lib/auth";

// function apiBase() {
//   const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
//   return b.replace(/\/+$/, "");
// }

// // GET /api/admin/customers/:id/documents?page=&limit=&type=&from=&to=&q=&sort=
// type Ctx = { params: Promise<{ id: string }> };

// export async function GET(req: NextRequest, { params }: Ctx) {
//   try {
//     const pid = await getProviderIdFromCookies();
//     if (!pid) {
//       return NextResponse.json(
//         { ok: false, error: "Unauthorized: missing provider" },
//         { status: 401 },
//       );
//     }

//     const { id } = await params;

//     const qs = req.nextUrl.searchParams.toString();
//     // const url = `${apiBase()}/customers/${encodeURIComponent(id)}/documents${
//     //   qs ? `?${qs}` : ""
//     // }`;

//     const url = `${apiBase()}/admin/customers/${encodeURIComponent(id)}/documents${qs ? `?${qs}` : ""}`;
//     console.log("[documents proxy] -> backend url =", url);

//     const r = await fetch(url, {
//       method: "GET",
//       headers: { "x-provider-id": pid },
//       cache: "no-store",
//     });

//     const text = await r.text();
//     let data: any;
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = { ok: false, raw: text };
//     }
//     return NextResponse.json(data, { status: r.status });
//   } catch (e: any) {
//     return NextResponse.json(
//       { ok: false, error: "Proxy failed", detail: String(e?.message ?? e) },
//       { status: 500 },
//     );
//   }
// }
