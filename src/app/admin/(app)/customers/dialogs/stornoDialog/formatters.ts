import type { BookingRef } from "../../types";

export function rawType(b?: Partial<BookingRef> | null) {
  return (b?.type || (b as any)?.offerType || "").trim();
}

export function labelFor(b: any) {
  const parts = [
    b.offerTitle || "—",
    rawType(b) || "—",
    b.status === "cancelled" ? "Cancelled" : b.status || "Active",
    b.date ? `since ${String(b.date).slice(0, 10)}` : undefined,
  ].filter(Boolean);
  return parts.join(" — ");
}

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function selectedCourseLabelFor(courseValue: string, groups: any[]) {
  if (!courseValue) return "All courses";
  for (const g of groups) {
    const found = g.items.find((opt: any) => opt.value === courseValue);
    if (found) return found.label;
  }
  return "All courses";
}
