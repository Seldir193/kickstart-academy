//src\app\admin\(app)\bookings\page.helpers.ts
import type { Booking } from "./types";

type SortKey = "newest" | "oldest" | "nameAsc" | "nameDesc";

export function sortBookings(items: Booking[], sort: SortKey) {
  const arr = [...items];
  return arr.sort(getComparator(sort));
}

function getComparator(sort: SortKey) {
  if (sort === "oldest") return byOldest;
  if (sort === "nameAsc") return byNameAsc;
  if (sort === "nameDesc") return byNameDesc;
  return byNewest;
}

function byOldest(a: Booking, b: Booking) {
  return ts(a.createdAt) - ts(b.createdAt);
}

function byNewest(a: Booking, b: Booking) {
  return ts(b.createdAt) - ts(a.createdAt);
}

function byNameAsc(a: Booking, b: Booking) {
  return nameKey(a).localeCompare(nameKey(b), "de", { sensitivity: "base" });
}

function byNameDesc(a: Booking, b: Booking) {
  return nameKey(b).localeCompare(nameKey(a), "de", { sensitivity: "base" });
}

function nameKey(b: Booking) {
  const first = String((b as any)?.firstName ?? "").trim();
  const last = String((b as any)?.lastName ?? "").trim();
  return `${first} ${last}`.trim().toLowerCase();
}

function ts(v: unknown) {
  const t = new Date(String(v ?? "")).getTime();
  return Number.isFinite(t) ? t : 0;
}
