//src\app\admin\(app)\customers\dialogs\stornoDialog\bookingDisplay.ts
import type { StatusFilter } from "./constants";

type Display = {
  title: string;
  invoice: string;
  venue: string;
  status: string;
};

export function bookingDisplay(
  b: any,
  statusFilter: StatusFilter,
  t: (key: string) => string,
): Display {
  const titleRaw = String(b?.offerTitle || "—").trim();
  const venueRaw = String(b?.venue || "").trim();

  const invoiceRaw = String(b?.invoiceNumber || b?.invoiceNo || "").trim();
  const invoice =
    invoiceRaw || t("common.admin.customers.stornoDialog.noInvoiceYet");

  const statusRaw = String(b?.status || "")
    .trim()
    .toLowerCase();
  const status =
    statusRaw === "cancelled"
      ? t("common.admin.customers.stornoDialog.statusCancelled")
      : t("common.admin.customers.stornoDialog.statusActive");

  const venue = shouldHideVenue(titleRaw, venueRaw) ? "" : venueRaw;

  const showStatus = statusFilter === "all";
  return {
    title: titleRaw,
    invoice,
    venue,
    status: showStatus ? status : "",
  };
}

function shouldHideVenue(title: string, venue: string) {
  if (!title || !venue) return false;
  const t = softNorm(title);
  const v = softNorm(venue);
  if (!v) return false;
  if (t.includes(v)) return true;

  const venueBits = venue
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(-3);

  return venueBits.some((bit) => {
    const b = softNorm(bit);
    return b && t.includes(b);
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
