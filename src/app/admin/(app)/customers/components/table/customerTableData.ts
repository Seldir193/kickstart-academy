import type { TFunction } from "i18next";
import type { Customer } from "../../types";
import type { CustomerRowType } from "./types";

const inactiveStatuses = ["cancelled", "deleted", "storno"];

function activeBookingStatus(booking: any): string {
  return ((booking?.status as string) || "") as string;
}

function hasActiveBooking(bookings: any[]): boolean {
  return bookings.some(
    (booking) => !inactiveStatuses.includes(activeBookingStatus(booking)),
  );
}

export function rowType(c: Customer): CustomerRowType {
  const bookings = c.bookings || [];
  return {
    isCustomer: bookings.length > 0,
    hasActive: hasActiveBooking(bookings),
  };
}

function childFullName(child: any): string {
  return [child?.firstName, child?.lastName].filter(Boolean).join(" ").trim();
}

function childrenArray(c: Customer): any[] {
  return Array.isArray((c as any).children) ? (c as any).children : [];
}

function uniqueNames(names: string[]): string[] {
  return Array.from(
    new Map(names.map((name) => [name.toLowerCase(), name])).values(),
  ) as string[];
}

function legacyChildName(c: Customer): string {
  return [c.child?.firstName, c.child?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function childEntries(c: Customer): string[] {
  const names = uniqueNames(
    childrenArray(c).map(childFullName).filter(Boolean),
  );
  if (names.length > 0) return names;
  const legacy = legacyChildName(c);
  return legacy ? [legacy] : [];
}

export function parentName(c: Customer, t: TFunction): string {
  return (
    [c.parent?.firstName, c.parent?.lastName].filter(Boolean).join(" ") ||
    t("admin.customers.table.common.empty")
  );
}

function streetText(c: Customer): string {
  return c.address?.street
    ? `${c.address.street} ${c.address.houseNo || ""}`
    : "";
}

export function addressText(c: Customer, t: TFunction): string {
  return (
    [streetText(c), c.address?.zip, c.address?.city]
      .filter(Boolean)
      .join(", ") || t("admin.customers.table.common.empty")
  );
}

export function emailText(c: Customer, t: TFunction): string {
  const anyC = c as any;
  return (
    c.parent?.email ||
    anyC?.email ||
    anyC?.emailLower ||
    t("admin.customers.table.common.empty")
  );
}

export function newsletterLabel(c: Customer, t: TFunction): string {
  const anyC = c as any;
  if (c.newsletter === true) return t("admin.customers.table.newsletter.yes");
  if (anyC?.marketingStatus === "pending" || !!anyC?.confirmToken)
    return t("admin.customers.table.newsletter.pending");
  return t("admin.customers.table.newsletter.no");
}
