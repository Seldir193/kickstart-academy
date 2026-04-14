import { MONTHS } from "./constants";
import type { RevenueResponse, YearlyRow } from "./types";

export function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function ceilToStep(n: number, step = 2000) {
  const x = Math.max(0, n || 0);
  return Math.max(step, Math.ceil(x / step) * step);
}

export function getProviderId() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("providerId") ||
    localStorage.getItem("ks_user_id") ||
    ""
  );
}

export function getEndpointBase(source: "invoices" | "derived") {
  return source === "derived"
    ? "/api/admin/revenue-derived"
    : "/api/admin/revenue";
}

export function getRevenueUrl(base: string, year: number, pid: string) {
  return `${base}?year=${year}${pid ? `&providerId=${encodeURIComponent(pid)}` : ""}`;
}

export function buildHeaders(pid: string) {
  return pid ? { "x-provider-id": pid } : undefined;
}

export function getYears(count: number) {
  const current = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => current - i);
}

export function getRecentFiveYears() {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - (4 - i));
}

export function getFallbackRevenue(): RevenueResponse {
  return {
    ok: false,
    year: 0,
    total: 0,
    monthly: [],
    counts: { positive: [], storno: [] },
  };
}

export function sumNumbers(items: number[]) {
  return items.reduce((a, b) => a + (Number(b) || 0), 0);
}

export function buildYearlyRow(year: number, res: RevenueResponse): YearlyRow {
  const pos = (res.counts?.positive || []) as number[];
  const sto = (res.counts?.storno || []) as number[];
  return {
    name: String(year),
    total: Number(res.total || 0),
    count: sumNumbers(pos),
    stornoCount: sumNumbers(sto),
  };
}

export function getMonthDefaultLabel(month: string) {
  return month.toUpperCase();
}

export function getMonthLabel(month: number, t: any) {
  if (month < 0)
    return t("common.admin.revenue.months.all", { defaultValue: "All months" });
  return t(`common.admin.revenue.months.${MONTHS[month]}`, {
    defaultValue: getMonthDefaultLabel(MONTHS[month]),
  });
}
