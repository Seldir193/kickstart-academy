import { useMemo } from "react";
import { pagesFor } from "./customerPageHelpers";

export function useCustomersPaginationState(total: number, limit: number, page: number, setPage: (next: (page: number) => number) => void) {
  const pages = useMemo(() => pagesFor(total, limit), [total, limit]);
  return { pages, goPrev: () => setPage((p) => Math.max(1, p - 1)), goNext: () => setPage((p) => Math.min(pages, p + 1)) };
}
