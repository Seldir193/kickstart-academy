"use client";

import { asList, qs, type ListResponse } from "../../utils/invoiceList";
import type { DocItem } from "../../utils/invoiceUi";
import {
  mapDunningDocToRow,
  type DunningDocApiItem,
} from "../../utils/dunningDocs";

export type LoaderArgs = {
  basePath: string;
  invoiceQuery: string;
  q: string;
  from: string;
  to: string;
  dunningFilter: string;
  sort: string;
};

function readParam(query: string, key: string, fallback = "") {
  return new URLSearchParams(query).get(key)?.trim() || fallback;
}

function buildFullInvoiceQuery(args: LoaderArgs) {
  const params = new URLSearchParams(args.invoiceQuery);

  params.set("page", "1");
  params.set("limit", "10000");

  return params.toString();
}

export async function fetchInvoices(args: LoaderArgs, signal?: AbortSignal) {
  const fullQuery = buildFullInvoiceQuery(args);

  const res = await fetch(`${args.basePath}?${fullQuery}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as ListResponse<DocItem>;
  return asList<DocItem>(json);
}

export async function fetchDunning(args: LoaderArgs, signal?: AbortSignal) {
  const dunningParams = qs({
    q: args.q,
    stage: args.dunningFilter === "all" ? "" : args.dunningFilter,
    from: args.from,
    to: args.to,
    limit: 10000,
  });

  const res = await fetch(
    `${args.basePath}/dunning-documents/search?${dunningParams}`,
    { method: "GET", credentials: "include", cache: "no-store", signal },
  );

  if (!res.ok) return [];

  const json = await res.json().catch(() => ({}));
  const raw = Array.isArray(json?.items)
    ? (json.items as DunningDocApiItem[])
    : [];

  return raw.map((x) => mapDunningDocToRow(x) as DocItem);
}

export function currentPage(args: LoaderArgs) {
  return Number(readParam(args.invoiceQuery, "page", "1")) || 1;
}

export function currentLimit(args: LoaderArgs) {
  return Number(readParam(args.invoiceQuery, "limit", "10")) || 10;
}

// //src\app\admin\(app)\invoices\hooks\invoicesLoader\loaderApi.ts
// "use client";

// import { asList, qs, type ListResponse } from "../../utils/invoiceList";
// import type { DocItem } from "../../utils/invoiceUi";
// import {
//   mapDunningDocToRow,
//   type DunningDocApiItem,
// } from "../../utils/dunningDocs";

// export type LoaderArgs = {
//   basePath: string;
//   invoiceQuery: string;
//   q: string;
//   from: string;
//   to: string;
//   dunningFilter: string;
//   sort: string;
// };

// export async function fetchInvoices(args: LoaderArgs, signal?: AbortSignal) {
//   const res = await fetch(`${args.basePath}?${args.invoiceQuery}`, {
//     method: "GET",
//     credentials: "include",
//     cache: "no-store",
//     signal,
//   });
//   if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   const json = (await res.json()) as ListResponse<DocItem>;
//   return asList<DocItem>(json);
// }

// export async function fetchDunning(args: LoaderArgs, signal?: AbortSignal) {
//   const dunningParams = qs({
//     q: args.q,
//     stage: args.dunningFilter === "all" ? "" : args.dunningFilter,
//     from: args.from,
//     to: args.to,
//     limit: 200,
//   });

//   const res = await fetch(
//     `${args.basePath}/dunning-documents/search?${dunningParams}`,
//     { method: "GET", credentials: "include", cache: "no-store", signal },
//   );

//   if (!res.ok) return [];
//   const json = await res.json().catch(() => ({}));
//   const raw = Array.isArray(json?.items)
//     ? (json.items as DunningDocApiItem[])
//     : [];
//   return raw.map((x) => mapDunningDocToRow(x) as any);
// }
