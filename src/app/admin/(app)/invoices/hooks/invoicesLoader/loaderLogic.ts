import type { DocItem } from "../../utils/invoiceUi";
import { sortMergedDocs } from "../../utils/mergeDocs";
import type { LoaderArgs } from "./loaderApi";
import { fetchDunning, fetchInvoices } from "./loaderApi";

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
): Promise<DocItem[]> {
  const [invoiceList, dunningRows] = await Promise.all([
    fetchInvoices(args, signal),
    fetchDunning(args, signal),
  ]);
  return sortMergedDocs([...invoiceList.items, ...dunningRows], args.sort);
}
