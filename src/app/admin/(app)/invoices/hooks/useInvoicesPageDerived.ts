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

function typeAllowed(row: InvoiceRow, types: Types) {
  const t = String((row as any)?.type || "").toLowerCase();

  if (t === "participation") return types.typeParticipation;
  if (t === "invoice") return types.typeInvoice;
  if (t === "cancellation") return types.typeCancellation;
  if (t === "storno") return types.typeStorno;
  if (t === "dunning") return types.typeDunning;

  if (
    t === "creditnote" ||
    t === "credit_note" ||
    t === "credit-note" ||
    t === "credit"
  ) {
    return types.typeCreditNote;
  }

  return true;
}

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

  function openPdf(item: DocItem) {
    const href = String((item as any)?.href || "").trim();
    if (!href) return;

    if (href.startsWith("/api/admin/invoices/dunning-documents/")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    const backendOrigin = String(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    )
      .trim()
      .replace(/\/api\/?$/, "");

    const isCreditPdf =
      (href.startsWith("/api/admin/bookings/") ||
        href.startsWith("/api/admin/customers/bookings/")) &&
      href.endsWith("/credit-note.pdf");

    if (isCreditPdf) {
      console.log("OPEN_PDF href:", href);
      console.log("OPEN_PDF backendOrigin:", backendOrigin);
      console.log("OPEN_PDF final:", `${backendOrigin}${href}`);
      window.open(`${backendOrigin}${href}`, "_blank", "noopener,noreferrer");
      return;
    }

    if (href.startsWith("/api/")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    const target = normalizePdfTarget(href);
    if (!target) return;

    window.open(target, "_blank", "noopener,noreferrer");
  }

  return {
    filteredItems,
    pagedItems,
    totalPages,
    openPdf,
  };
}

// //src\app\admin\(app)\invoices\hooks\useInvoicesPageDerived.ts
// "use client";

// import { useEffect, useMemo } from "react";
// import type { InvoiceRow } from "../utils/invoiceList";
// import {
//   filterInvoiceRows,
//   type DunningFilter,
//   type PaymentFilter,
// } from "../utils/invoiceFilters";
// import { normalizePdfTarget, type DocItem } from "../utils/invoiceUi";

// type Types = {
//   typeParticipation: boolean;
//   typeInvoice: boolean;
//   typeCancellation: boolean;
//   typeStorno: boolean;
//   typeDunning: boolean;
//   typeCreditNote: boolean;
// };

// function typeAllowed(row: InvoiceRow, types: Types) {
//   const t = String((row as any)?.type || "").toLowerCase();
//   if (t === "participation") return types.typeParticipation;
//   if (t === "invoice") return types.typeInvoice;
//   if (t === "cancellation") return types.typeCancellation;
//   if (t === "storno") return types.typeStorno;
//   if (t === "dunning") return types.typeDunning;

//   if (
//     t === "creditnote" ||
//     t === "credit_note" ||
//     t === "credit-note" ||
//     t === "credit"
//   ) {
//     return types.typeCreditNote;
//   }

//   return true;
// }

// export function useInvoicesPageDerived(args: {
//   items: DocItem[];
//   paymentFilter: PaymentFilter;
//   dunningFilter: DunningFilter;
//   types: Types;
//   page: number;
//   limit: number;
//   setPage: (n: number) => void;
// }) {
//   const filteredItems = useMemo(() => {
//     const typeFiltered = (args.items as InvoiceRow[]).filter((r) =>
//       typeAllowed(r, args.types),
//     );

//     return filterInvoiceRows(
//       typeFiltered,
//       args.paymentFilter,
//       args.dunningFilter,
//     ) as DocItem[];
//   }, [args.items, args.paymentFilter, args.dunningFilter, args.types]);

//   // const totalPages = useMemo(() => {
//   //   return Math.max(
//   //     1,
//   //     Math.ceil(filteredItems.length / Math.max(1, args.limit)),
//   //   );
//   // }, [filteredItems.length, args.limit]);

//   // const pagedItems = useMemo(() => {
//   //   const start = (args.page - 1) * args.limit;
//   //   return filteredItems.slice(start, start + args.limit);
//   // }, [filteredItems, args.page, args.limit]);

//   // useEffect(() => {
//   //   if (args.page > totalPages) args.setPage(1);
//   // }, [args.page, totalPages, args.setPage]);

//   const totalPages = useMemo(() => {
//     return Math.max(1, args.page);
//   }, [args.page]);

//   const pagedItems = useMemo(() => {
//     return filteredItems;
//   }, [filteredItems]);

//   function openPdf(item: DocItem) {
//     const href = String((item as any)?.href || "").trim();
//     if (!href) return;

//     if (href.startsWith("/api/admin/invoices/dunning-documents/")) {
//       window.open(href, "_blank", "noopener,noreferrer");
//       return;
//     }

//     const backendOrigin = String(
//       process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
//     )
//       .trim()
//       .replace(/\/api\/?$/, "");

//     const isCreditPdf =
//       (href.startsWith("/api/admin/bookings/") ||
//         href.startsWith("/api/admin/customers/bookings/")) &&
//       href.endsWith("/credit-note.pdf");

//     if (isCreditPdf) {
//       console.log("OPEN_PDF href:", href);
//       console.log("OPEN_PDF backendOrigin:", backendOrigin);
//       console.log("OPEN_PDF final:", `${backendOrigin}${href}`);
//       window.open(`${backendOrigin}${href}`, "_blank", "noopener,noreferrer");
//       return;
//     }

//     if (href.startsWith("/api/")) {
//       window.open(href, "_blank", "noopener,noreferrer");
//       return;
//     }

//     const target = normalizePdfTarget(href);
//     if (!target) return;
//     window.open(target, "_blank", "noopener,noreferrer");
//   }

//   return { filteredItems, pagedItems, totalPages, openPdf };
// }
