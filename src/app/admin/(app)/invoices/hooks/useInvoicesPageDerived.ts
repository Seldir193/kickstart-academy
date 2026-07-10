"use client";

import { useMemo } from "react";
import type { InvoiceRow } from "../utils/invoiceList";
import {
  filterInvoiceRows,
  type DunningFilter,
  type PaymentFilter,
} from "../utils/invoiceFilters";
import { normalizePdfTarget, type DocItem } from "../utils/invoiceUi";

type Types = {
  typeParticipation: boolean;
  typeInvoice: boolean;
  typeCancellation: boolean;
  typeStorno: boolean;
  typeDunning: boolean;
  typeCreditNote: boolean;
};

type Args = {
  items: DocItem[];
  total: number;
  paymentFilter: PaymentFilter;
  dunningFilter: DunningFilter;
  types: Types;
  page: number;
  limit: number;
  setPage: (n: number) => void;
};

const creditTypes = new Set([
  "creditnote",
  "credit_note",
  "credit-note",
  "credit",
]);

function typeAllowed(row: InvoiceRow, types: Types) {
  const t = String(
    (row as InvoiceRow & { type?: unknown }).type || "",
  ).toLowerCase();
  if (t === "participation") return types.typeParticipation;
  if (t === "invoice") return types.typeInvoice;
  if (t === "cancellation") return types.typeCancellation;
  if (t === "storno") return types.typeStorno;
  if (t === "dunning") return types.typeDunning;
  if (creditTypes.has(t)) return types.typeCreditNote;
  return true;
}

function backendOrigin() {
  return String(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
    .trim()
    .replace(/\/api\/?$/, "");
}

function isCreditPdf(href: string) {
  return (
    (href.startsWith("/api/admin/bookings/") ||
      href.startsWith("/api/admin/customers/bookings/")) &&
    href.endsWith("/credit-note.pdf")
  );
}

function openWindow(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

function openCreditPdf(href: string) {
  const origin = backendOrigin();
  console.log("OPEN_PDF href:", href);
  console.log("OPEN_PDF backendOrigin:", origin);
  console.log("OPEN_PDF final:", `${origin}${href}`);
  openWindow(`${origin}${href}`);
}

function resolvePdfTarget(href: string) {
  if (href.startsWith("/api/admin/invoices/dunning-documents/")) return href;
  if (href.startsWith("/api/")) return href;
  return normalizePdfTarget(href);
}

function openPdfTarget(item: DocItem) {
  const href = String((item as DocItem & { href?: unknown }).href || "").trim();
  if (!href) return;
  if (isCreditPdf(href)) return openCreditPdf(href);
  const target = resolvePdfTarget(href);
  if (target) openWindow(target);
}

export function useInvoicesPageDerived(args: Args) {
  const filteredItems = useMemo(() => {
    const typeFiltered = (args.items as InvoiceRow[]).filter((row) =>
      typeAllowed(row, args.types),
    );

    return filterInvoiceRows(
      typeFiltered,
      args.paymentFilter,
      args.dunningFilter,
    ) as DocItem[];
  }, [args.items, args.paymentFilter, args.dunningFilter, args.types]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(args.total / Math.max(1, args.limit)));
  }, [args.total, args.limit]);

  const pagedItems = useMemo(() => {
    return filteredItems;
  }, [filteredItems]);

  return {
    filteredItems,
    pagedItems,
    totalPages,
    openPdf: openPdfTarget,
  };
}
