//src\app\admin\(app)\invoices\hooks\useInvoicesPageState.ts
"use client";

import { useMemo, useState } from "react";
import { qs } from "../utils/invoiceList";
import { sortParamFrom, type SortOrder } from "../utils/invoiceUi";
import type { DunningFilter, PaymentFilter } from "../utils/invoiceFilters";

export function useInvoicesPageState() {
  const [typeParticipation, setTypeParticipation] = useState(true);
  const [typeCancellation, setTypeCancellation] = useState(true);
  const [typeStorno, setTypeStorno] = useState(true);
  const [typeDunning, setTypeDunning] = useState(true);
  const [typeCreditNote, setTypeCreditNote] = useState(true);

  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [dunningFilter, setDunningFilter] = useState<DunningFilter>("all");

  const sort = useMemo(() => sortParamFrom(sortOrder), [sortOrder]);

  const serverTypes = useMemo(() => {
    const next: string[] = [];
    if (typeParticipation) next.push("participation");
    if (typeCancellation) next.push("cancellation");
    if (typeStorno) next.push("storno");
    if (typeCreditNote) next.push("creditnote");
    return next;
  }, [typeParticipation, typeCancellation, typeStorno, typeCreditNote]);

  const uiTypes = useMemo(() => {
    const next = [...serverTypes];
    if (typeDunning) next.push("dunning");
    return next;
  }, [serverTypes, typeDunning]);

  const invoiceQuery = useMemo(() => {
    const p: Record<string, any> = { page, limit, from, to, q, sort };
    if (serverTypes.length) p.type = serverTypes.join(",");
    return qs(p);
  }, [page, limit, from, to, q, sort, serverTypes]);

  const downloadQuery = useMemo(() => {
    const p: Record<string, any> = { from, to, q, sort };
    if (serverTypes.length) p.type = serverTypes.join(",");
    return qs(p);
  }, [from, to, q, sort, serverTypes]);

  return {
    typeParticipation,
    typeCancellation,
    typeStorno,
    typeDunning,
    typeCreditNote,

    setTypeParticipation,
    setTypeCancellation,
    setTypeStorno,
    setTypeDunning,
    setTypeCreditNote,

    q,
    setQ,
    from,
    setFrom,
    to,
    setTo,
    sortOrder,
    setSortOrder,
    sort,
    page,
    setPage,
    limit,
    setLimit,
    paymentFilter,
    setPaymentFilter,
    dunningFilter,
    setDunningFilter,
    invoiceQuery,
    downloadQuery,
    uiTypes,
  };
}

// //src\app\admin\(app)\invoices\hooks\useInvoicesPageState.ts
// "use client";

// import { useMemo, useState } from "react";
// import { qs } from "../utils/invoiceList";
// import { sortParamFrom, type SortOrder } from "../utils/invoiceUi";
// import type { DunningFilter, PaymentFilter } from "../utils/invoiceFilters";

// export function useInvoicesPageState() {
//   const [typeParticipation, setTypeParticipation] = useState(true);
//   const [typeCancellation, setTypeCancellation] = useState(true);
//   const [typeStorno, setTypeStorno] = useState(true);
//   const [typeDunning, setTypeDunning] = useState(true);
//   const [typeCreditNote, setTypeCreditNote] = useState(true);

//   const [q, setQ] = useState("");
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);

//   const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
//   const [dunningFilter, setDunningFilter] = useState<DunningFilter>("all");

//   const sort = useMemo(() => sortParamFrom(sortOrder), [sortOrder]);

//   const serverTypes = useMemo(() => {
//     const next: string[] = [];
//     if (typeParticipation) next.push("participation");
//     if (typeCancellation) next.push("cancellation");
//     if (typeStorno) next.push("storno");
//     if (typeCreditNote) next.push("creditnote");
//     return next;
//   }, [typeParticipation, typeCancellation, typeStorno, typeCreditNote]);

//   const uiTypes = useMemo(() => {
//     const next = [...serverTypes];
//     if (typeDunning) next.push("dunning");
//     return next;
//   }, [serverTypes, typeDunning]);

//   const invoiceQuery = useMemo(
//     () =>
//       qs({ page: 1, limit: 200, from, to, q, sort, type: uiTypes.join(",") }),
//     [from, to, q, sort, uiTypes],
//   );

//   const downloadQuery = useMemo(() => {
//     return qs({
//       page: 1,
//       limit: 5000,
//       type: uiTypes.join(","),
//       from,
//       to,
//       q,
//       sort,
//     });
//   }, [uiTypes, from, to, q, sort]);

//   return {
//     typeParticipation,
//     typeCancellation,
//     typeStorno,
//     typeDunning,
//     typeCreditNote,

//     setTypeParticipation,
//     setTypeCancellation,
//     setTypeStorno,
//     setTypeDunning,
//     setTypeCreditNote,

//     q,
//     setQ,
//     from,
//     setFrom,
//     to,
//     setTo,
//     sortOrder,
//     setSortOrder,
//     sort,
//     page,
//     setPage,
//     limit,
//     setLimit,
//     paymentFilter,
//     setPaymentFilter,
//     dunningFilter,
//     setDunningFilter,
//     invoiceQuery,
//     downloadQuery,
//     uiTypes,
//   };
// }

// //src\app\admin\(app)\invoices\hooks\useInvoicesPageState.ts
// "use client";

// import { useMemo, useState } from "react";
// import { qs } from "../utils/invoiceList";
// import { sortParamFrom, type SortOrder } from "../utils/invoiceUi";
// import type { DunningFilter, PaymentFilter } from "../utils/invoiceFilters";

// export function useInvoicesPageState() {
//   const [typeParticipation, setTypeParticipation] = useState(true);
//   const [typeCancellation, setTypeCancellation] = useState(true);
//   const [typeStorno, setTypeStorno] = useState(true);
//   const [typeDunning, setTypeDunning] = useState(true);

//   const [q, setQ] = useState("");
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);

//   const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
//   const [dunningFilter, setDunningFilter] = useState<DunningFilter>("all");

//   const sort = useMemo(() => sortParamFrom(sortOrder), [sortOrder]);

//   const serverTypes = useMemo(() => {
//     const next: string[] = [];
//     if (typeParticipation) next.push("participation");
//     if (typeCancellation) next.push("cancellation");
//     if (typeStorno) next.push("storno");

//     return next;
//   }, [typeParticipation, typeCancellation, typeStorno]);

//   const uiTypes = useMemo(() => {
//     const next = [...serverTypes];
//     if (typeDunning) next.push("dunning");
//     return next;
//   }, [serverTypes, typeDunning]);

//   const invoiceQuery = useMemo(
//     () => qs({ page: 1, limit: 200, from, to, q, sort }),
//     [from, to, q, sort],
//   );

//   const downloadQuery = useMemo(() => {
//     return qs({
//       page: 1,
//       limit: 5000,
//       type: uiTypes.join(","),
//       from,
//       to,
//       q,
//       sort,
//     });
//   }, [uiTypes, from, to, q, sort]);

//   return {
//     typeParticipation,
//     typeCancellation,
//     typeStorno,
//     typeDunning,

//     setTypeParticipation,
//     setTypeCancellation,
//     setTypeStorno,
//     setTypeDunning,

//     q,
//     setQ,
//     from,
//     setFrom,
//     to,
//     setTo,
//     sortOrder,
//     setSortOrder,
//     sort,
//     page,
//     setPage,
//     limit,
//     setLimit,
//     paymentFilter,
//     setPaymentFilter,
//     dunningFilter,
//     setDunningFilter,
//     invoiceQuery,
//     downloadQuery,
//     uiTypes,
//   };
// }
