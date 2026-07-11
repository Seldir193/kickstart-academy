import type { Voucher } from "../../types";

export function voucherId(item: Voucher) {
  return String(item?._id || "").trim();
}

export function formatVoucherAmount(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

export function getInactiveVoucherIds(items: Voucher[], ids: Set<string>) {
  return items.filter((item) => ids.has(item._id) && !item.active).map(voucherId);
}

export function getActiveVoucherIds(items: Voucher[], ids: Set<string>) {
  return items.filter((item) => ids.has(item._id) && item.active).map(voucherId);
}
