// src\app\api\admin\upload\[filename]\route.ts
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { promises as fsp } from "fs";
import path from "path";

const PUBLIC_UP_DIR = path.join(process.cwd(), "public", "uploads", "news");
const LEGACY_UP_DIR = path.join(process.cwd(), "uploads", "news");

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

async function fileExists(filePath: string) {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getExistingFilePath(fileName: string) {
  const publicPath = path.join(PUBLIC_UP_DIR, fileName);

  if (await fileExists(publicPath)) {
    return publicPath;
  }

  return path.join(LEGACY_UP_DIR, fileName);
}

function isInvalidFileName(name: string) {
  return !name || name.includes("..") || path.isAbsolute(name);
}

type Ctx = { params: Promise<{ filename: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { filename } = await params;
    const name = decodeURIComponent(filename || "");

    if (isInvalidFileName(name)) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }

    const filePath = await getExistingFilePath(name);
    const buf = await fsp.readFile(filePath);
    const ab = buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength,
    ) as ArrayBuffer;

    return new Response(ab, {
      headers: {
        "Content-Type": getMimeType(path.extname(name)),
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
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextRequest } from "next/server";
// import { promises as fsp } from "fs";
// import path from "path";

// const UP_DIR = path.join(process.cwd(), "uploads", "news");

// function mimeByExt(ext: string) {
//   switch (ext.toLowerCase()) {
//     case ".png":
//       return "image/png";
//     case ".jpg":
//     case ".jpeg":
//       return "image/jpeg";
//     case ".webp":
//       return "image/webp";
//     case ".gif":
//       return "image/gif";
//     default:
//       return "application/octet-stream";
//   }
// }

// type Ctx = { params: Promise<{ filename: string }> };

// export async function GET(_req: NextRequest, { params }: Ctx) {
//   try {
//     const { filename } = await params;
//     const name = decodeURIComponent(filename || "");

//     if (!name || name.includes("..") || path.isAbsolute(name)) {
//       return new Response(JSON.stringify({ ok: false }), { status: 400 });
//     }

//     const filePath = path.join(UP_DIR, name);
//     const buf = await fsp.readFile(filePath);
//     const ab = buf.buffer.slice(
//       buf.byteOffset,
//       buf.byteOffset + buf.byteLength,
//     ) as ArrayBuffer;

//     return new Response(ab, {
//       headers: {
//         "Content-Type": mimeByExt(path.extname(name)),
//         "Content-Length": String(buf.byteLength),
//         "Cache-Control": "public, max-age=31536000, immutable",
//       },
//     });
//   } catch {
//     return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
//       status: 404,
//     });
//   }
// }
