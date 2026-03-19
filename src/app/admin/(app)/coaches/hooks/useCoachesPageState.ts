// src/app/admin/(app)/coaches/hooks/useCoachesPageState.ts
"use client";

import { useMemo, useState } from "react";
import type { Coach, SortKey } from "../types";
import { paginate, sortCoaches } from "../utils";
import {
  SplitLists,
  classifyProvider,
  cleanStr,
  isProviderItem,
  mergeAndFilter,
  pickMyLists,
  removeBySlug,
  removeFromMine,
  removeFromProviders,
  splitCombined,
  upsertBySlug,
  upsertMine,
} from "../pageHelpers";
import { PAGE_LIMIT } from "../constants";

export function useCoachesPageState(args: { isSuper: boolean; meId: string }) {
  const { isSuper, meId } = args;

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const [split, setSplit] = useState<SplitLists | null>(null);
  const [mineLocal, setMineLocal] = useState<Coach[]>([]);

  const [pagePendingProviders, setPagePendingProviders] = useState(1);
  const [pageApprovedProviders, setPageApprovedProviders] = useState(1);
  const [pageRejectedProviders, setPageRejectedProviders] = useState(1);

  const [pageMyPending, setPageMyPending] = useState(1);
  const [pageMyApproved, setPageMyApproved] = useState(1);
  const [pageMyRejected, setPageMyRejected] = useState(1);

  const [selectApprovedProviders, setSelectApprovedProviders] = useState(false);
  const [selectRejectedProviders, setSelectRejectedProviders] = useState(false);
  const [selectMyPending, setSelectMyPending] = useState(false);
  const [selectMyApproved, setSelectMyApproved] = useState(false);
  const [selectMyRejected, setSelectMyRejected] = useState(false);

  function resetSelections() {
    setSelectApprovedProviders(false);
    setSelectRejectedProviders(false);
    setSelectMyPending(false);
    setSelectMyApproved(false);
    setSelectMyRejected(false);
  }

  function resetPages() {
    setPagePendingProviders(1);
    setPageApprovedProviders(1);
    setPageRejectedProviders(1);
    setPageMyPending(1);
    setPageMyApproved(1);
    setPageMyRejected(1);
  }

  function setSplitFromResponse(resp: any) {
    setSplit(splitCombined(resp));
  }

  function setMineFromItems(items: Coach[]) {
    setMineLocal(Array.isArray(items) ? items : []);
  }

  function applyMineUpsert(next: Coach) {
    setMineLocal((prev) => upsertBySlug(prev, next));
  }

  function applyMineRemove(slug: string) {
    setMineLocal((prev) => removeBySlug(prev, cleanStr(slug)));
  }

  function applySplitUpsert(next: Coach) {
    setSplit((prev) => {
      if (!prev) return prev;
      const mineFirst = upsertMine(prev, next);
      return removeFromProviders(mineFirst, cleanStr((next as any).slug));
    });
  }

  function applySplitMoveProvider(next: Coach) {
    const slug = cleanStr((next as any).slug);
    setSplit((prev) => {
      if (!prev) return prev;
      const cleared = removeFromProviders(prev, slug);
      const removedMine = removeFromMine(cleared, slug);
      return classifyProvider(removedMine, next);
    });
  }

  function applySplitRemove(slug: string) {
    const s = cleanStr(slug);
    setSplit((prev) => {
      if (!prev) return prev;
      return removeFromMine(removeFromProviders(prev, s), s);
    });
  }

  const mineSource = useMemo(
    () => (isSuper ? split?.mine || [] : mineLocal),
    [isSuper, mineLocal, split],
  );

  const providersPendingSource = useMemo(
    () => (isSuper ? split?.providersPending || [] : []),
    [isSuper, split],
  );
  const providersApprovedSource = useMemo(
    () => (isSuper ? split?.providersApproved || [] : []),
    [isSuper, split],
  );
  const providersRejectedSource = useMemo(
    () => (isSuper ? split?.providersRejected || [] : []),
    [isSuper, split],
  );

  const myFilteredSorted = useMemo(
    () => sortCoaches(mergeAndFilter(mineSource, q), sort),
    [mineSource, q, sort],
  );

  const myLists = useMemo(
    () => pickMyLists(myFilteredSorted),
    [myFilteredSorted],
  );

  const providersPendingAll = useMemo(() => {
    const base = providersPendingSource.filter((c) => isProviderItem(c, meId));
    return sortCoaches(mergeAndFilter(base, q), sort);
  }, [providersPendingSource, q, sort, meId]);

  const providersApprovedAll = useMemo(() => {
    const base = providersApprovedSource.filter((c) => isProviderItem(c, meId));
    return sortCoaches(mergeAndFilter(base, q), sort);
  }, [providersApprovedSource, q, sort, meId]);

  const providersRejectedAll = useMemo(() => {
    const base = providersRejectedSource.filter((c) => isProviderItem(c, meId));
    return sortCoaches(mergeAndFilter(base, q), sort);
  }, [providersRejectedSource, q, sort, meId]);

  const providersPending = useMemo(
    () => paginate(providersPendingAll, pagePendingProviders, PAGE_LIMIT),
    [providersPendingAll, pagePendingProviders],
  );
  const providersApproved = useMemo(
    () => paginate(providersApprovedAll, pageApprovedProviders, PAGE_LIMIT),
    [providersApprovedAll, pageApprovedProviders],
  );
  const providersRejected = useMemo(
    () => paginate(providersRejectedAll, pageRejectedProviders, PAGE_LIMIT),
    [providersRejectedAll, pageRejectedProviders],
  );

  const myPending = useMemo(
    () => paginate(myLists.pending, pageMyPending, PAGE_LIMIT),
    [myLists.pending, pageMyPending],
  );
  const myApproved = useMemo(
    () => paginate(myLists.approved, pageMyApproved, PAGE_LIMIT),
    [myLists.approved, pageMyApproved],
  );
  const myRejected = useMemo(
    () => paginate(myLists.rejected, pageMyRejected, PAGE_LIMIT),
    [myLists.rejected, pageMyRejected],
  );

  return {
    q,
    sort,
    setQ,
    setSort,
    split,
    mineLocal,
    setSplitFromResponse,
    setMineFromItems,
    resetSelections,
    resetPages,
    applyMineUpsert,
    applyMineRemove,
    applySplitUpsert,
    applySplitMoveProvider,
    applySplitRemove,
    providersPendingAll,
    providersApprovedAll,
    providersRejectedAll,
    providersPending,
    providersApproved,
    providersRejected,
    myLists,
    myPending,
    myApproved,
    myRejected,
    pages: {
      pagePendingProviders,
      setPagePendingProviders,
      pageApprovedProviders,
      setPageApprovedProviders,
      pageRejectedProviders,
      setPageRejectedProviders,
      pageMyPending,
      setPageMyPending,
      pageMyApproved,
      setPageMyApproved,
      pageMyRejected,
      setPageMyRejected,
    },
    selects: {
      selectApprovedProviders,
      setSelectApprovedProviders,
      selectRejectedProviders,
      setSelectRejectedProviders,
      selectMyPending,
      setSelectMyPending,
      selectMyApproved,
      setSelectMyApproved,
      selectMyRejected,
      setSelectMyRejected,
    },
  };
}
