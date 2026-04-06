//src\app\components\training-card\utils.ts
import { ALL_COURSE_OPTIONS } from "@/app/lib/courseOptions";
import type { Offer, TrainingSortKey } from "./types";

export function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

function timeFromObjectIdHex(id?: unknown) {
  const hex = safeText(id);
  if (hex.length < 8) return 0;
  const sec = parseInt(hex.slice(0, 8), 16);
  return Number.isFinite(sec) ? sec * 1000 : 0;
}

function safeTime(item: Offer) {
  const iso = item.updatedAt || item.createdAt;
  const ms = iso ? new Date(iso).getTime() : 0;
  if (Number.isFinite(ms) && ms > 0) return ms;
  return timeFromObjectIdHex(item._id);
}

function trainingLabel(item: Offer, t?: (key: string) => string) {
  const title = safeText(item.title);
  if (title) return title;
  const type = safeText(item.type);
  if (type) return type;

  return t ? t("common.training.offerFallback") : "Offer";
}

export function sortTrainingItems(items: Offer[], sort: TrainingSortKey) {
  const next = [...items];

  if (sort === "newest") {
    return next.sort((a, b) => safeTime(b) - safeTime(a));
  }

  if (sort === "oldest") {
    return next.sort((a, b) => safeTime(a) - safeTime(b));
  }

  const collator = new Intl.Collator("en", { sensitivity: "base" });
  const dir = sort === "training_asc" ? 1 : -1;

  return next.sort(
    (a, b) => dir * collator.compare(trainingLabel(a), trainingLabel(b)),
  );
}

// export function trainingSortLabel(
//   sort: TrainingSortKey,
//   t: (key: string) => string,
// ) {
//   if (sort === "newest") return "Newest";
//   if (sort === "oldest") return "Oldest";
//   if (sort === "training_asc") return "Training A–Z";
//   return "Training Z–A";
// }

export function trainingSortLabel(
  sort: TrainingSortKey,
  t: (key: string) => string,
) {
  if (sort === "newest") return t("common.training.filters.sort.newest");
  if (sort === "oldest") return t("common.training.filters.sort.oldest");
  if (sort === "training_asc") {
    return t("common.training.filters.sort.trainingAsc");
  }
  return t("common.training.filters.sort.trainingDesc");
}

export function buildOffersQueryParams(args: {
  q: string;
  locationFilter: string;
  page: number;
  limit: number;
  courseValue: string;
}) {
  const { q, locationFilter, page, limit, courseValue } = args;

  const params = new URLSearchParams();

  if (q.trim().length >= 2) params.set("q", q.trim());
  if (locationFilter) {
    params.set("location", locationFilter);
    params.set("city", locationFilter);
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  const chosen = ALL_COURSE_OPTIONS.find((x) => x.value === courseValue);

  if (chosen) {
    if (chosen.mode === "type") {
      params.set("type", chosen.value);
    } else {
      params.set("category", chosen.category);
      params.set("sub_type", chosen.value);
    }
  }

  return params;
}

// import { ALL_COURSE_OPTIONS } from "@/app/lib/courseOptions";

// export function clsx(...xs: Array<string | false | undefined | null>) {
//   return xs.filter(Boolean).join(" ");
// }

// export function buildOffersQueryParams(args: {
//   q: string;
//   locationFilter: string;
//   page: number;
//   limit: number;
//   courseValue: string;
// }) {
//   const { q, locationFilter, page, limit, courseValue } = args;

//   const params = new URLSearchParams();

//   if (q.trim().length >= 2) params.set("q", q.trim());
//   if (locationFilter) {
//     params.set("location", locationFilter);
//     params.set("city", locationFilter);
//   }

//   params.set("page", String(page));
//   params.set("limit", String(limit));

//   const chosen = ALL_COURSE_OPTIONS.find((x) => x.value === courseValue);

//   if (chosen) {
//     if (chosen.mode === "type") {
//       params.set("type", chosen.value);
//     } else {
//       params.set("category", chosen.category);
//       params.set("sub_type", chosen.value);
//     }
//   }

//   return params;
// }

// import { ALL_COURSE_OPTIONS } from "@/app/lib/courseOptions";

// export function clsx(...xs: Array<string | false | undefined | null>) {
//   return xs.filter(Boolean).join(" ");
// }

// export function buildOffersQueryParams(args: {
//   q: string;
//   locationFilter: string;
//   page: number;
//   limit: number;
//   courseValue: string;
// }) {
//   const { q, locationFilter, page, limit, courseValue } = args;

//   const params = new URLSearchParams();
//   if (q.trim().length >= 2) params.set("q", q.trim());
//   if (locationFilter) params.set("location", locationFilter);
//   params.set("page", String(page));
//   params.set("limit", String(limit));

//   const chosen = ALL_COURSE_OPTIONS.find((x) => x.value === courseValue);
//   if (chosen) {
//     if (chosen.mode === "type") {
//       params.set("type", chosen.value);
//     } else {
//       params.set("category", chosen.category);
//       params.set("sub_type", chosen.value);
//     }
//   }

//   return params;
// }
