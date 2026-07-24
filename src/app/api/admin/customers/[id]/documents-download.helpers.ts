import { NextResponse, type NextRequest } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

export type DocumentsDownloadCtx = { params: Promise<{ id: string }> };

export type DocumentsDownloadConfig = {
  pathSuffix: string;
  accept: string;
  fallbackContentType: string;
  fallbackDisposition: (id: string) => string;
  proxyErrorLabel: string;
};

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

async function upstreamFailedResponse(upstream: Response) {
  const text = await upstream.text().catch(() => "");
  return NextResponse.json(
    {
      ok: false,
      status: upstream.status,
      error: "Upstream failed",
      detail: text.slice(0, 2000),
    },
    { status: upstream.status },
  );
}

function buildDownloadHeaders(
  upstream: Response,
  id: string,
  config: DocumentsDownloadConfig,
) {
  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") || config.fallbackContentType,
  );
  headers.set(
    "Content-Disposition",
    upstream.headers.get("content-disposition") ||
      config.fallbackDisposition(id),
  );
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Encoding", "identity");
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  return headers;
}

export async function proxyCustomerDocumentsDownload(
  req: NextRequest,
  ctx: DocumentsDownloadCtx,
  config: DocumentsDownloadConfig,
) {
  try {
    const pid = await getProviderIdFromCookies();
    if (!pid) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: missing provider" },
        { status: 401 },
      );
    }

    const { id } = await ctx.params;

    const qs = req.nextUrl.searchParams.toString();
    const url = `${apiBase()}/customers/${encodeURIComponent(id)}/${
      config.pathSuffix
    }${qs ? `?${qs}` : ""}`;

    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        "X-Provider-Id": pid,
        Accept: config.accept,
      },
      cache: "no-store",
    });

    if (!upstream.ok) return await upstreamFailedResponse(upstream);

    const headers = buildDownloadHeaders(upstream, id, config);

    if (upstream.body) {
      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers,
      });
    }

    const buf = await upstream.arrayBuffer();
    return new NextResponse(Buffer.from(buf), {
      status: upstream.status,
      headers,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: config.proxyErrorLabel, detail: msg },
      { status: 500 },
    );
  }
}
