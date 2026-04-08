// src/app/admin/news/news.ts
import type { News } from "./types";
import { normalizeIsoDate } from "./date";
import { safeSlug } from "./utils/slug";
import { formatDateOnly } from "./utils/dateFormat";

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeTags(tags?: string[]) {
  return (tags || []).map((t) => clean(t)).filter(Boolean);
}

export function ensureNewsDefaults(input: Partial<News>) {
  return {
    _id: input._id,
    date: normalizeIsoDate(input.date),
    title: input.title || "",
    slug: input.slug || "",
    excerpt: input.excerpt || "",
    content: input.content || "",
    coverImage: input.coverImage || "",
    media: input.media || [],
    published: input.published ?? true,
    category: input.category || "News",
    tags: normalizeTags(input.tags),
    rejectionReason: clean(input.rejectionReason),
    rejectedAt: clean(input.rejectedAt) || null,
  } satisfies News;
}

export function finalizeNewsPayload(form: News) {
  const title = clean(form.title);
  const rawSlug = clean(form.slug);
  const slug = rawSlug ? rawSlug : safeSlug(title);

  return {
    ...form,
    title,
    slug,
    tags: normalizeTags(form.tags),
    date: normalizeIsoDate(form.date),
    rejectionReason: clean((form as any).rejectionReason),
  };
}

export function buildWpPreviewUrl(slug: string) {
  return `${encodeURIComponent(slug || "")}`;
}

// export function toDisplayDate(iso: string) {
//   return iso ? new Date(iso).toLocaleDateString() : "";
// }
export function toDisplayDate(iso: string, lang?: string) {
  return formatDateOnly(iso, lang);
}
