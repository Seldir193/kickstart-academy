//src\app\admin\(app)\customers\dialogs\cancelDialog\bookingDisplay.ts
import type { StatusFilter } from "./constants";

type Display = {
  title: string;
  invoice: string;
  venue: string;
  status: string;
};

export function bookingDisplay(
  input: any | "select" | null,
  nonCancelable: boolean,
  statusFilter: StatusFilter,
  t: (key: string) => string,
): Display {
  if (nonCancelable)
    return empty(
      t("common.admin.customers.cancelDialog.noCancellableBookings"),
      statusFilter,
      t,
    );
  if (input === "select")
    return empty(
      t("common.admin.customers.cancelDialog.select"),
      statusFilter,
      t,
    );
  if (!input)
    return empty(
      t("common.admin.customers.cancelDialog.noCancellableBookings"),
      statusFilter,
      t,
    );
  return fromBooking(input, statusFilter, t);
}

function empty(
  title: string,
  statusFilter: StatusFilter,
  t: (key: string) => string,
): Display {
  return {
    title,
    invoice: "",
    venue: "",
    status: statusLabel(statusFilter, "", t),
  };
}

function fromBooking(
  b: any,
  statusFilter: StatusFilter,
  t: (key: string) => string,
): Display {
  const title = String(
    b?.offerTitle || t("common.admin.customers.cancelDialog.empty"),
  ).trim();
  const venueRaw = String(b?.venue || "").trim();
  const venue = shouldHideVenue(title, venueRaw) ? "" : venueRaw;
  const invoice = invoiceLabel(b, t);
  const status = statusLabel(statusFilter, String(b?.status || ""), t);
  return { title, invoice, venue, status };
}

function invoiceLabel(b: any, t: (key: string) => string) {
  const raw = String(b?.invoiceNumber || b?.invoiceNo || "").trim();
  return raw || t("common.admin.customers.cancelDialog.noInvoiceYet");
}

function statusLabel(
  filter: StatusFilter,
  raw: string,
  t: (key: string) => string,
) {
  if (filter !== "all") return "";
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  return s === "cancelled"
    ? t("common.admin.customers.cancelDialog.statusCancelled")
    : t("common.admin.customers.cancelDialog.statusActive");
}

function shouldHideVenue(title: string, venue: string) {
  if (!title || !venue) return false;
  const t = softNorm(title);
  const v = softNorm(venue);
  if (v && t.includes(v)) return true;
  const bits = venue
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(-3);
  return bits.some((bit) => {
    const b = softNorm(bit);
    return Boolean(b) && t.includes(b);
  });
}

function softNorm(s: string) {
  return (s || "")
    .replace(/[Ää]/g, "ae")
    .replace(/[Öö]/g, "oe")
    .replace(/[Üü]/g, "ue")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[\s\-\._]/g, "");
}
