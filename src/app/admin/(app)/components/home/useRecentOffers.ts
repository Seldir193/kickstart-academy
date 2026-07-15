import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { fetchRecentOffers } from "./homeApi";
import type { RecentOffersState } from "./types";

const LIMIT = 10;

export function useRecentOffers(page: number) {
  const [state, setState] = useState<RecentOffersState>({
    items: [],
    total: 0,
    loadingList: true,
  });
  useEffect(() => loadRecentOffers(page, setState), [page]);
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(state.total / LIMIT)),
    [state.total],
  );
  return { ...state, limit: LIMIT, pageCount };
}

function loadRecentOffers(
  page: number,
  setState: Dispatch<SetStateAction<RecentOffersState>>,
) {
  let abort = false;
  setState((prev) => ({ ...prev, loadingList: true }));
  fetchRecentOffers(page, LIMIT)
    .then((data) => !abort && setState({ ...data, loadingList: false }))
    .catch(() => undefined)
    .finally(
      () => !abort && setState((prev) => ({ ...prev, loadingList: false })),
    );
  return () => {
    abort = true;
  };
}
