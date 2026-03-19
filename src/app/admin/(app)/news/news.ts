// src/app/admin/news/news.ts
import type { News } from "./types";
import { normalizeIsoDate } from "./date";
import { safeSlug } from "./utils/slug";

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

export function toDisplayDate(iso: string) {
  return iso ? new Date(iso).toLocaleDateString() : "";
}

// // src/app/admin/news/news.ts
// import type { News } from "./types";
// import { normalizeIsoDate } from "./date";
// import { safeSlug } from "./utils/slug";

// function normalizeTags(tags?: string[]) {
//   return (tags || []).map((t) => t.trim()).filter(Boolean);
// }

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// export function ensureNewsDefaults(input: Partial<News>) {
//   return {
//     date: normalizeIsoDate(input.date),
//     title: input.title || "",
//     slug: input.slug || "",
//     excerpt: input.excerpt || "",
//     content: input.content || "",
//     coverImage: input.coverImage || "",
//     coverCaption: input.coverCaption || "",
//     media: input.media || [],
//     published: input.published ?? true,
//     category: input.category || "News",
//     tags: normalizeTags(input.tags),
//     rejectionReason: clean(input.rejectionReason),
//     rejectedAt: clean(input.rejectedAt) || undefined,
//     _id: input._id,
//   } satisfies News;
// }

// export function finalizeNewsPayload(form: News) {
//   const title = clean(form.title);
//   const slug = clean(form.slug) ? clean(form.slug) : safeSlug(title);
//   const tags = normalizeTags(form.tags);
//   const rejectionReason = clean((form as any).rejectionReason);
//   return {
//     ...form,
//     title,
//     slug,
//     tags,
//     rejectionReason,
//     date: normalizeIsoDate(form.date),
//   };
// }

// export function buildWpPreviewUrl(slug: string) {
//   return `${encodeURIComponent(slug || "")}`;
// }

// export function toDisplayDate(iso: string) {
//   return iso ? new Date(iso).toLocaleDateString() : "";
// }
