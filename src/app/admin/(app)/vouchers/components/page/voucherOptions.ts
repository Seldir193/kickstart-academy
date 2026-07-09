import { toastText } from "@/lib/toast-messages";
import type { Voucher, VoucherStatus } from "../../types";

export type SortKey = "newest" | "oldest" | "code_asc" | "code_desc";
export type Translate = (key: string) => string;

export function sortLabel(t: Translate, sort: SortKey) {
  if (sort === "newest") return toastText(t, "common.admin.vouchers.sort.newest", "Newest first");
  if (sort === "oldest") return toastText(t, "common.admin.vouchers.sort.oldest", "Oldest first");
  if (sort === "code_asc") return toastText(t, "common.admin.vouchers.sort.codeAsc", "Code A–Z");
  return toastText(t, "common.admin.vouchers.sort.codeDesc", "Code Z–A");
}

export function statusLabel(t: Translate, status: VoucherStatus, total: number) {
  if (status === "all") return toastText(t, "common.admin.vouchers.status.all", "All") + ` (${total})`;
  if (status === "active") return toastText(t, "common.admin.vouchers.status.active", "Active");
  return toastText(t, "common.admin.vouchers.status.inactive", "Inactive");
}

function tsOf(value: string) {
  const time = new Date(String(value || "")).getTime();
  return Number.isFinite(time) ? time : 0;
}

function codeKey(voucher: Voucher) {
  return String(voucher.code || "").trim().toLowerCase();
}

export function sortItems(items: Voucher[], sort: SortKey) {
  const arr = [...items];
  if (sort === "newest") return arr.sort((a, b) => tsOf(b.createdAt) - tsOf(a.createdAt));
  if (sort === "oldest") return arr.sort((a, b) => tsOf(a.createdAt) - tsOf(b.createdAt));
  if (sort === "code_asc") return arr.sort((a, b) => codeKey(a).localeCompare(codeKey(b), "de"));
  return arr.sort((a, b) => codeKey(b).localeCompare(codeKey(a), "de"));
}
