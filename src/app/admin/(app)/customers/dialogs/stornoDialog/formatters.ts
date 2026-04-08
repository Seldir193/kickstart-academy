//src\app\admin\(app)\customers\dialogs\stornoDialog\formatters.ts
import type { BookingRef } from "../../types";

export function rawType(b?: Partial<BookingRef> | null) {
  return (b?.type || (b as any)?.offerType || "").trim();
}

export function labelFor(
  b: any,
  t: (key: string, options?: Record<string, unknown>) => string,
  formatDateOnly: (value?: string | null, lang?: string) => string,
  lang?: string,
) {
  const parts = [
    b.offerTitle || "—",
    rawType(b) || "—",
    b.status === "cancelled"
      ? t("common.admin.customers.stornoDialog.statusCancelled")
      : b.status || t("common.admin.customers.stornoDialog.statusActive"),
    b.date
      ? t("common.admin.customers.stornoDialog.sinceDate", {
          date: formatDateOnly(String(b.date), lang),
        })
      : undefined,
  ].filter(Boolean);
  return parts.join(" — ");
}

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function selectedCourseLabelFor(
  courseValue: string,
  groups: any[],
  t: (key: string) => string,
) {
  if (!courseValue) return t("common.admin.customers.stornoDialog.allCourses");
  for (const g of groups) {
    const found = g.items.find((opt: any) => opt.value === courseValue);
    if (found) return found.label;
  }
  return t("common.admin.customers.stornoDialog.allCourses");
}
