import type { Booking, ProgramFilter, Status, StatusOrAll } from "../../types";

export type SortKey = "newest" | "oldest" | "name_asc" | "name_desc";
export type Translate = (key: string) => string;

export function courseLabel(t: Translate, program: ProgramFilter) {
  if (program === "camp") return t("common.admin.onlineBookings.course.camp");
  if (program === "power") return t("common.admin.onlineBookings.course.power");
  return t("common.admin.onlineBookings.course.all");
}

export function statusLabel(
  t: Translate,
  params: {
    status: StatusOrAll;
    total: number;
    totalAll: number | null;
    counts: Partial<Record<Status, number>>;
  },
) {
  if (params.status === "all") return allStatusLabel(t, params);
  if (params.status === "confirmed") return countLabel(t, "confirmed", params);
  if (params.status === "cancelled") return countLabel(t, "cancelled", params);
  return countLabel(t, "deleted", params);
}

function allStatusLabel(
  t: Translate,
  params: { total: number; totalAll: number | null },
) {
  const total = params.totalAll ?? params.total;
  return `${t("common.admin.onlineBookings.status.all")} (${total})`;
}

function countLabel(
  t: Translate,
  status: Status,
  params: { counts: Partial<Record<Status, number>> },
) {
  const key = `common.admin.onlineBookings.status.${status}`;
  return `${t(key)} (${params.counts[status] ?? 0})`;
}

export function sortLabel(t: Translate, sort: SortKey) {
  if (sort === "newest") return t("common.admin.onlineBookings.sort.newest");
  if (sort === "oldest") return t("common.admin.onlineBookings.sort.oldest");
  if (sort === "name_asc") return t("common.admin.onlineBookings.sort.nameAsc");
  return t("common.admin.onlineBookings.sort.nameDesc");
}

function tsOf(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function nameKey(booking: Booking) {
  return `${booking.firstName} ${booking.lastName}`.trim().toLowerCase();
}

export function sortBookings(items: Booking[], sort: SortKey) {
  const arr = [...items];
  if (sort === "newest")
    return arr.sort((a, b) => tsOf(b.createdAt) - tsOf(a.createdAt));
  if (sort === "oldest")
    return arr.sort((a, b) => tsOf(a.createdAt) - tsOf(b.createdAt));
  if (sort === "name_asc") return arr.sort((a, b) => compareNames(a, b));
  return arr.sort((a, b) => compareNames(b, a));
}

function compareNames(a: Booking, b: Booking) {
  return nameKey(a).localeCompare(nameKey(b), "de", { sensitivity: "base" });
}
