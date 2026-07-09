import type { SortOrder } from "../types";

export function sortLabel(order: SortOrder, t: (key: string) => string) {
  return order === "oldest" ? t("admin.customers.documents.sort.oldest") : t("admin.customers.documents.sort.newest");
}

export function nextPage(page: number, totalPages: number) {
  return Math.min(totalPages, page + 1);
}

export function prevPage(page: number) {
  return Math.max(1, page - 1);
}
