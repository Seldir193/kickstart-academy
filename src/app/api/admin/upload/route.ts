export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { promises as fsp } from "fs";
import path from "path";
import crypto from "crypto";

const UP_DIR = path.join(process.cwd(), "public", "uploads", "news");

const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

function safeExtFromMime(mime: string) {
  return EXT_BY_MIME[mime] ?? "";
}

const NEWS_COVER_MIMES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const NEWS_MEDIA_MIMES = [...NEWS_COVER_MIMES, "video/mp4", "video/webm"];

function isAllowedForPurpose(purpose: string, mime: string) {
  if (purpose === "news-cover") return NEWS_COVER_MIMES.includes(mime);
  if (purpose === "news-media") return NEWS_MEDIA_MIMES.includes(mime);
  return true;
}

function getNewsUploadUrl(fileName: string) {
  return `/uploads/news/${encodeURIComponent(fileName)}`;
}

function getNewsUploadApiUrl(fileName: string) {
  return `/api/admin/upload/${encodeURIComponent(fileName)}`;
}

function getFallbackExt(mime: string, wantedName: string) {
  return (
    safeExtFromMime(mime) ||
    (wantedName.match(/\.(png|jpe?g|webp|gif|mp4|webm)$/i)?.[0] ?? ".png")
  );
}

function getBaseName(wantedName: string) {
  return (
    wantedName
      .replace(/[^\w.\-]+/g, "")
      .replace(/\.(png|jpe?g|webp|gif|mp4|webm)$/i, "") || "news"
  );
}

function createFileName(wantedName: string, mime: string) {
  const rand = crypto.randomBytes(6).toString("hex");
  const baseName = getBaseName(wantedName);
  const fallbackExt = getFallbackExt(mime, wantedName);

  return `${baseName}-${Date.now()}-${rand}${fallbackExt}`;
}

async function readUploadFile(req: NextRequest) {
  const form = await req.formData();

  return {
    file: form.get("file"),
    wantedName: String(form.get("filename") || "").trim(),
    purpose: String(form.get("purpose") || ""),
  };
}

function rejectUpload(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

async function saveUploadedFile(file: Blob, wantedName: string, mime: string) {
  await fsp.mkdir(UP_DIR, { recursive: true });
  const fileName = createFileName(wantedName, mime);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fsp.writeFile(path.join(UP_DIR, fileName), buffer);
  return fileName;
}

function buildUploadResponse(fileName: string, mime: string) {
  return NextResponse.json({
    ok: true,
    filename: fileName,
    url: getNewsUploadUrl(fileName),
    apiUrl: getNewsUploadApiUrl(fileName),
    mimetype: mime,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { file, wantedName, purpose } = await readUploadFile(req);
    if (!(file instanceof Blob)) return rejectUpload("no file", 400);

    const mime = file.type || "application/octet-stream";
    if (!isAllowedForPurpose(purpose, mime))
      return rejectUpload("unsupported_media_type", 415);

    const fileName = await saveUploadedFile(file, wantedName, mime);
    return buildUploadResponse(fileName, mime);
  } catch (e: any) {
    return rejectUpload(String(e?.message || e), 500);
  }
}
