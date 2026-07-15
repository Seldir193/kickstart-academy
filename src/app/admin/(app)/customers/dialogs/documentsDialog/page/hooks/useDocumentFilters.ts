import { useState } from "react";
import type { FilterState } from "../types";

export function useDocumentFilters(): FilterState {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortOrder, setSortOrder] =
    useState<FilterState["sortOrder"]>("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  return {
    q,
    from,
    to,
    sortOrder,
    page,
    limit,
    setQ,
    setFrom,
    setTo,
    setSortOrder,
    setPage,
    setLimit,
  };
}
