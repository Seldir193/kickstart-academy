export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { promises as fsp } from "fs";
import path from "path";

const UP_DIR = path.join(process.cwd(), "public", "uploads", "coach");

function getMimeType(ext: string) {
  const types: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };

  return types[ext.toLowerCase()] || "application/octet-stream";
}

type Ctx = { params: Promise<{ filename: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { filename } = await params;
    const name = decodeURIComponent(filename || "");

    if (name.includes("..") || path.isAbsolute(name)) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }

    const filePath = path.join(UP_DIR, name);
    const buf = await fsp.readFile(filePath);
    const type = getMimeType(path.extname(name));
    const ab = buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength,
    ) as ArrayBuffer;

    return new Response(ab, {
      headers: {
        "Content-Type": type,
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
