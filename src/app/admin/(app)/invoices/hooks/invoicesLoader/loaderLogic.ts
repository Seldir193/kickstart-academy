import type { DocItem } from "../../utils/invoiceUi";
import { sortMergedDocs } from "../../utils/mergeDocs";
import type { LoaderArgs } from "./loaderApi";
import {
  currentLimit,
  currentPage,
  fetchDunning,
  fetchInvoices,
} from "./loaderApi";

function slicePage(items: DocItem[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

export function stableArgs(args: LoaderArgs) {
  return {
    basePath: args.basePath,
    invoiceQuery: args.invoiceQuery,
    q: args.q,
    from: args.from,
    to: args.to,
    dunningFilter: args.dunningFilter,
    sort: args.sort,
  };
}

export async function runLoad(
  args: LoaderArgs,
  signal: AbortSignal,
): Promise<{ items: DocItem[]; total: number }> {
  const [invoiceList, dunningRows] = await Promise.all([
    fetchInvoices(args, signal),
    fetchDunning(args, signal),
  ]);

  const merged = sortMergedDocs(
    [...invoiceList.items, ...dunningRows],
    args.sort,
  );

  const page = currentPage(args);
  const limit = currentLimit(args);

  return {
    items: slicePage(merged, page, limit),
    total: merged.length,
  };
}
// //src\app\admin\(app)\invoices\hooks\invoicesLoader\loaderLogic.ts
// import type { DocItem } from "../../utils/invoiceUi";
// import { sortMergedDocs } from "../../utils/mergeDocs";
// import type { LoaderArgs } from "./loaderApi";
// import { fetchDunning, fetchInvoices } from "./loaderApi";

// export function stableArgs(args: LoaderArgs) {
//   return {
//     basePath: args.basePath,
//     invoiceQuery: args.invoiceQuery,
//     q: args.q,
//     from: args.from,
//     to: args.to,
//     dunningFilter: args.dunningFilter,
//     sort: args.sort,
//   };
// }

// export async function runLoad(
//   args: LoaderArgs,
//   signal: AbortSignal,
// ): Promise<DocItem[]> {
//   const [invoiceList, dunningRows] = await Promise.all([
//     fetchInvoices(args, signal),
//     fetchDunning(args, signal),
//   ]);
//   return sortMergedDocs([...invoiceList.items, ...dunningRows], args.sort);
// }
