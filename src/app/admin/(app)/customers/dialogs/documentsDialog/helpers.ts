//src\app\admin\(app)\customers\dialogs\documentsDialog\helpers.ts
import type { TFunction } from "i18next";
import type { DocItem, SortOrder } from "./types";

export function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

export function normalizePdfHref(rawHref: string): string {
  try {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const u = new URL(rawHref, origin);

    if (u.pathname.startsWith("/api/")) return u.pathname + u.search;
    if (u.pathname.startsWith("/admin/")) return "/api" + u.pathname + u.search;

    if (
      u.pathname.startsWith("/customers/") ||
      u.pathname.startsWith("/bookings/")
    ) {
      return "/api/admin" + u.pathname + u.search;
    }

    return u.pathname + u.search;
  } catch {
    return rawHref;
  }
}

export function sortParamFrom(order: SortOrder) {
  return order === "oldest" ? "issuedAt:asc" : "issuedAt:desc";
}

// export function invoiceLabelFrom(item: DocItem) {
//   const raw = String(
//     (item as any)?.invoiceNumber || (item as any)?.invoiceNo || "",
//   ).trim();
//   return raw || "No invoice yet";
// }

// export function invoiceLabelFrom(item: DocItem) {
//   const raw = String(
//     (item as any)?.invoiceNumber ||
//       (item as any)?.invoiceNo ||
//       (item as any)?.cancellationNo ||
//       (item as any)?.stornoNo ||
//       (item as any)?.stornoNumber ||
//       "",
//   ).trim();
//   return raw || "No invoice yet";
// }

export function invoiceLabelFrom(item: DocItem, t: TFunction) {
  const raw = docNoFrom(item);
  return raw || t("admin.customers.documents.invoice.noInvoiceYet");
}

export function customerNoFrom(item: DocItem) {
  const v = (item as any)?.customerNumber;
  return v == null ? "" : String(v).trim();
}

// export function docNoFrom(item: DocItem) {
//   const raw = String(
//     (item as any)?.invoiceNo ||
//       (item as any)?.invoiceNumber ||
//       (item as any)?.cancellationNo ||
//       (item as any)?.stornoNo ||
//       (item as any)?.stornoNumber ||
//       "",
//   ).trim();
//   return raw;
// }

export function docNoFrom(item: DocItem) {
  const t = String((item as any)?.type || "").toLowerCase();

  const invoiceNo = String(
    (item as any)?.invoiceNo || (item as any)?.invoiceNumber || "",
  ).trim();

  const creditNoteNo = String((item as any)?.creditNoteNo || "").trim();

  const cancellationNo = String((item as any)?.cancellationNo || "").trim();

  const stornoNo = String(
    (item as any)?.stornoNo || (item as any)?.stornoNumber || "",
  ).trim();

  if (t === "creditnote") return creditNoteNo || invoiceNo;
  if (t === "cancellation") return cancellationNo || invoiceNo;
  if (t === "storno") return stornoNo || invoiceNo;
  return invoiceNo;
}

export function issuedLabelFrom(issuedAt?: string, language: string) {
  if (!issuedAt) return "-";
  const date = new Date(issuedAt);
  if (Number.isNaN(date.getTime())) return "-";
  //return t.toLocaleDateString("de-DE");
  return date.toLocaleDateString(language);
}
