//src\app\admin\(app)\orte\utils.ts
"use client";

import type { Place } from "@/types/place";

export function displayPlaceId(p: Place & { publicId?: number }) {
  if (
    typeof (p as any).publicId === "number" &&
    Number.isFinite((p as any).publicId)
  ) {
    return String((p as any).publicId);
  }
  const hex = String((p as any)._id || "");
  return "1" + hex.slice(-7).toUpperCase();
}

export function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function timeFromObjectIdHex(id?: unknown) {
  const hex = String(id || "").trim();
  if (hex.length < 8) return 0;
  const sec = parseInt(hex.slice(0, 8), 16);
  return Number.isFinite(sec) ? sec * 1000 : 0;
}

function safeTime(p: any) {
  const iso = p?.createdAt || p?.updatedAt || p?.date;
  const t = iso ? new Date(iso).getTime() : 0;
  if (Number.isFinite(t) && t > 0) return t;
  return timeFromObjectIdHex(p?._id);
}

export function sortPlaces<T extends Place>(
  items: T[],
  sort: "newest" | "oldest" | "city_asc" | "city_desc",
) {
  const next = [...items];
  if (sort === "newest")
    return next.sort((a: any, b: any) => safeTime(b) - safeTime(a));
  if (sort === "oldest")
    return next.sort((a: any, b: any) => safeTime(a) - safeTime(b));

  const collator = new Intl.Collator("de", { sensitivity: "base" });
  const dir = sort === "city_asc" ? 1 : -1;

  return next.sort(
    (a: any, b: any) =>
      dir * collator.compare(safeText(a?.city), safeText(b?.city)),
  );
}
