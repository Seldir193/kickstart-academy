import { ALL_COURSE_OPTIONS } from "@/app/lib/courseOptions";

export function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
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
  if (locationFilter) params.set("location", locationFilter);
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
