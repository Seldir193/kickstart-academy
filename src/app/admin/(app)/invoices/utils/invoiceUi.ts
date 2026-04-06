//src\app\admin\(app)\invoices\utils\invoiceUi.ts
"use client";
import type { TFunction } from "i18next";
export type SortOrder = "newest" | "oldest";

export type DocItem = {
  id: string;
  bookingId: string;
  type:
    | "participation"
    | "cancellation"
    | "storno"
    | "dunning"
    | "creditnote"
    | string;
  title: string;
  issuedAt?: string;
  href: string;

  status?: string;
  offerTitle?: string;
  offerType?: string;

  customerName?: string;
  customerChildName?: string;
  customerEmail?: string;

  customerId?: string;
  customerNumber?: number | string;

  invoiceNo?: string;
  invoiceNumber?: string;
  cancellationNo?: string;
  stornoNo?: string;
  stornoNumber?: string;

  creditNoteNo?: string;
  creditNoteDate?: string;
  fileName?: string;
};

export function typeLabel(type: string, t: TFunction) {
  const x = String(type || "").toLowerCase();
  if (x === "participation")
    return t("common.admin.invoices.docType.participation");
  if (x === "cancellation")
    return t("common.admin.invoices.docType.cancellation");
  if (x === "storno") return t("common.admin.invoices.docType.storno");
  if (x === "dunning") return t("common.admin.invoices.docType.dunning");
  if (x === "creditnote" || x === "credit_note" || x === "credit")
    return t("common.admin.invoices.docType.creditNote");
  return type || t("common.admin.invoices.docType.document");
}

export function iconForType(t: string) {
  const type = String(t || "").toLowerCase();
  if (type === "invoice") return "/icons/invoice.svg";
  if (type === "participation") return "/icons/participation.svg";
  if (type === "cancellation") return "/icons/cancellation.svg";
  if (type === "storno") return "/icons/storno.svg";
  if (type === "dunning") return "/icons/mail_send.svg";
  if (type === "creditnote" || type === "credit_note" || type === "credit")
    return "/icons/credit_note.svg";
  return "/icons/invoice.svg";
}

export function customerNoFrom(d: DocItem) {
  const v = (d as any)?.customerNumber;
  return v == null ? "" : String(v).trim();
}

export function docNoFrom(d: DocItem) {
  return String(
    (d as any)?.creditNoteNo ||
      (d as any)?.invoiceNo ||
      (d as any)?.invoiceNumber ||
      (d as any)?.cancellationNo ||
      (d as any)?.stornoNo ||
      (d as any)?.stornoNumber ||
      "",
  ).trim();
}

function isKnownDocSuffix(s: string) {
  const x = String(s || "").toLowerCase();
  return (
    x.includes("participation confirmation") ||
    x.includes("cancellation confirmation") ||
    x.includes("cancellation invoice") ||
    x.includes("dunning notice") ||
    x.includes("payment reminder") ||
    x.includes("credit note")
  );
}

export function stripDocTypeSuffix(raw: string) {
  const s = String(raw || "").trim();
  const parts = s.split("–").map((x) => x.trim());
  if (parts.length <= 1) return s;

  const last = String(parts[parts.length - 1] || "");
  if (!isKnownDocSuffix(last)) return s;
  return parts.slice(0, -1).join(" – ").trim();
}

function cutAfterDash(s: string) {
  if (!s.includes("—")) return s;
  return s.split("—")[0].trim();
}

function removeZipTail(s: string) {
  return s.replace(/\b\d{5}\b.*$/g, "").trim();
}

function cleanupCommasSpaces(s: string) {
  let x = s.replace(/\s*,\s*$/g, "").trim();
  x = x.replace(/\s{2,}/g, " ").trim();
  return x;
}

export function stripAddressNoise(raw: string) {
  let s = String(raw || "").trim();
  if (!s) return s;
  s = cutAfterDash(s);
  s = removeZipTail(s);
  s = cleanupCommasSpaces(s);
  return s;
}

export function displayTitle(d: DocItem, t: TFunction) {
  const base = stripAddressNoise(stripDocTypeSuffix(d.title || ""));
  return base || typeLabel(d.type, t);
}

export function metaLine(
  d: DocItem,
  fmtDate: (iso: string) => string,
  t: TFunction,
) {
  const customerNo = customerNoFrom(d);
  const parts = [
    customerNo
      ? `{t("common.admin.invoices.meta.customerNo")} ${customerNo}`
      : "",
    d.customerName ? d.customerName : "",
    d.issuedAt
      ? `{t("common.admin.invoices.meta.issued")}  ${fmtDate(d.issuedAt)}`
      : "",
  ].filter(Boolean);
  return parts.join(" · ");
}

export function sortLabel(order: SortOrder, t: TFunction) {
  return order === "oldest"
    ? t("common.admin.invoices.sort.oldest")
    : t("common.admin.invoices.sort.newest");
}

export function sortParamFrom(order: SortOrder) {
  return order === "oldest" ? "issuedAt:asc" : "issuedAt:desc";
}

export function normalizePdfTarget(href: string) {
  const publicApi = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_BACKEND_API_BASE ||
    "http://127.0.0.1:5000/api"
  ).replace(/\/$/, "");

  if (!href) return "";
  if (href.startsWith(`${publicApi}/`)) return href.replace(publicApi, "/api");
  if (href.startsWith("/admin/")) return `/api${href}`;
  if (!href.startsWith("http") && !href.startsWith("/"))
    return `/api/${href.replace(/^\/+/, "")}`;
  return href;
}

export function displayDocNo(d: DocItem) {
  const raw = docNoFrom(d);
  if (!raw) return "";
  return raw.replace(/\//g, "-");
}
