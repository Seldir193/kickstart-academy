// src/app/admin/news/components/NewsDialog.helpers.ts
"use client";

import type { News } from "../types";
import { todayIsoDate } from "../date";
import { ensureNewsDefaults, finalizeNewsPayload } from "../news";
import { safeSlug } from "../utils/slug";
import { WP_DETAIL_BASE } from "../constants";

type UploadResult = { url: string; mimetype: string };

export const maxContentChars = 3000;

export function defaultForm() {
  return ensureNewsDefaults({ date: todayIsoDate(), published: true });
}

export function buildPreviewUrl(slug: string) {
  const s = String(slug || "").trim();
  return s ? `${WP_DETAIL_BASE}${encodeURIComponent(s)}` : "";
}

export function templateText() {
  return [
    "## Intro",
    "",
    "Write 2–4 sentences that hook the reader.",
    "",
    "## Main section",
    "",
    "1. First point",
    "2. Second point",
    "3. Third point",
    "",
    "> Add a quote if needed.",
    "",
    "## Checklist",
    "",
    "- Bullet one",
    "- Bullet two",
    "- Bullet three",
  ].join("\n");
}

export function applyInsert(value: string, insert: string) {
  const base = value ? `${value}\n\n` : "";
  return `${base}${insert}`.trim();
}

export function mergeDraftIntoItem(n: News) {
  const anyN = n as any;
  const has = anyN?.hasDraft === true;
  const d = anyN?.draft && typeof anyN.draft === "object" ? anyN.draft : null;
  return has && d ? ({ ...n, ...d } as News) : n;
}

export function clampContent(value: string) {
  return (value || "").slice(0, maxContentChars);
}

export function setTagsFromText(text: string) {
  return String(text || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function uploadCoverFile(args: {
  file?: File;
  upload: (file: File) => Promise<UploadResult>;
  onUrl: (url: string) => void;
  onReset: () => void;
}) {
  const { file, upload, onUrl, onReset } = args;
  if (!file) return;
  const up = await upload(file);
  onUrl(up.url);
  onReset();
}

export async function saveForm(args: {
  form: News;
  save: (n: News) => Promise<void>;
}) {
  const final = finalizeNewsPayload(args.form);
  if (!String(final.title || "").trim()) throw new Error("Title is missing.");
  await args.save(final);
}

export function autoSlugIfEmpty(args: { title: string; slug: string }) {
  const slug = String(args.slug || "").trim();
  const title = String(args.title || "").trim();
  return slug ? slug : title ? safeSlug(title) : "";
}

export function normalizeSlug(value: string) {
  return safeSlug(String(value || ""));
}
