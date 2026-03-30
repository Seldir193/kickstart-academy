export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { promises as fsp } from "fs";
import path from "path";

const UP_DIR = path.join(process.cwd(), "uploads", "news");

function mimeByExt(ext: string) {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

type Ctx = { params: Promise<{ filename: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { filename } = await params;
    const name = decodeURIComponent(filename || "");

    if (!name || name.includes("..") || path.isAbsolute(name)) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }

    const filePath = path.join(UP_DIR, name);
    const buf = await fsp.readFile(filePath);
    const ab = buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength,
    ) as ArrayBuffer;

    return new Response(ab, {
      headers: {
        "Content-Type": mimeByExt(path.extname(name)),
        "Content-Length": String(buf.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
      status: 404,
    });
  }
}
