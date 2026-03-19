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
): Display {
  if (nonCancelable) return empty("No cancellable bookings", statusFilter);
  if (input === "select") return empty("Select…", statusFilter);
  if (!input) return empty("No cancellable bookings", statusFilter);
  return fromBooking(input, statusFilter);
}

function empty(title: string, statusFilter: StatusFilter): Display {
  return {
    title,
    invoice: "",
    venue: "",
    status: statusLabel(statusFilter, ""),
  };
}

function fromBooking(b: any, statusFilter: StatusFilter): Display {
  const title = String(b?.offerTitle || "—").trim();
  const venueRaw = String(b?.venue || "").trim();
  const venue = shouldHideVenue(title, venueRaw) ? "" : venueRaw;
  const invoice = invoiceLabel(b);
  const status = statusLabel(statusFilter, String(b?.status || ""));
  return { title, invoice, venue, status };
}

function invoiceLabel(b: any) {
  const raw = String(b?.invoiceNumber || b?.invoiceNo || "").trim();
  return raw || "No invoice yet";
}

function statusLabel(filter: StatusFilter, raw: string) {
  if (filter !== "all") return "";
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  return s === "cancelled" ? "Cancelled" : "Active";
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
