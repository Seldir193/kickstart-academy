export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { promises as fsp } from "fs";
import path from "path";
import crypto from "crypto";

const UP_DIR = path.join(process.cwd(), "public", "uploads", "coach");

function safeExtFromMime(mime: string) {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

function getCoachUploadUrl(fileName: string) {
  return `/uploads/coach/${encodeURIComponent(fileName)}`;
}

function getCoachUploadApiUrl(fileName: string) {
  return `/api/uploads/coach/${encodeURIComponent(fileName)}`;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const wantedName = String(form.get("filename") || "").trim();

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { ok: false, error: "no file" },
        { status: 400 },
      );
    }

    await fsp.mkdir(UP_DIR, { recursive: true });

    const mime = file.type || "application/octet-stream";
    const extFromMime = safeExtFromMime(mime);
    const fallbackExt =
      extFromMime ||
      (wantedName.match(/\.(png|jpe?g|webp|gif)$/i)?.[0] ?? ".png");

    const rand = crypto.randomBytes(6).toString("hex");
    const baseName =
      wantedName
        .replace(/[^\w.\-]+/g, "")
        .replace(/\.(png|jpe?g|webp|gif)$/i, "") || "coach";
    const fileName = `${baseName}-${Date.now()}-${rand}${fallbackExt}`;

    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    await fsp.writeFile(path.join(UP_DIR, fileName), buf);

    return NextResponse.json({
      ok: true,
      filename: fileName,
      url: getCoachUploadUrl(fileName),
      apiUrl: getCoachUploadApiUrl(fileName),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 },
    );
  }
}
