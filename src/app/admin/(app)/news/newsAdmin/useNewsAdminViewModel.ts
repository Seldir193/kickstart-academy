//src\app\admin\(app)\news\newsAdmin\useNewsAdminViewModel.ts
"use client";

import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { News } from "../types";
import { buildPreview, clean, pageNext, pagePrev } from "./helpers";
import { useNewsAdminActions } from "./useNewsAdminActions";
import { useNewsAdminState } from "./useNewsAdminState";

function metaCount(n: number, suffix = "") {
  return n ? `(${n}${suffix})` : "";
}

export function useNewsAdminViewModel() {
  const { t } = useTranslation();
  const s = useNewsAdminState();

  const resetSelections = useCallback(() => {
    s.setMinePendingSelectMode(false);
    s.setMineApprovedSelectMode(false);
    s.setMineRejectedSelectMode(false);
    s.setProvApprovedSelectMode(false);
    s.setProvRejectedSelectMode(false);
  }, [s]);

  const a = useNewsAdminActions({
    isSuper: s.isSuper,
    setMutating: s.setMutating,
    setPublishedBusyId: s.setPublishedBusyId,
    reloadMap: s.reloadMap,

    setCreateOpen: s.setCreateOpen,
    setEditItem: s.setEditItem,

    setRejectOpen: s.setRejectOpen,
    setRejectTarget: s.setRejectTarget,
    rejectTarget: s.rejectTarget,

    setInfoOpen: s.setInfoOpen,
    setInfoTarget: s.setInfoTarget,

    resetSelections,
  });

  const anyError =
    s.mine.error ||
    s.providerPending.error ||
    s.providerApproved.error ||
    s.providerRejected.error ||
    s.minePending.error ||
    s.mineApproved.error ||
    s.mineRejected.error;

  const myPendingItems = useMemo(
    () => (s.minePending.items as any[]) || [],
    [s.minePending.items],
  );
  const myApprovedItems = useMemo(
    () => (s.mineApproved.items as any[]) || [],
    [s.mineApproved.items],
  );
  const myRejectedItems = useMemo(
    () => (s.mineRejected.items as any[]) || [],
    [s.mineRejected.items],
  );

  const myApprovedItemsEffective = useMemo(() => {
    return (s.isSuper ? (s.mine.items as any[]) : myApprovedItems) as any[];
  }, [s.isSuper, s.mine.items, myApprovedItems]);

  const previewSlug = clean(s.editItem?.slug);
  const previewHref = previewSlug ? buildPreview(previewSlug) : "";

  const showAlarm = s.isSuper && s.providerPending.items.length > 0;

  const providerPendingMeta = metaCount(
    s.providerPending.items.length,
    t("common.admin.news.meta.newSuffix"),
  );
  const providerApprovedMeta = metaCount(s.providerApproved.items.length);
  const providerRejectedMeta = metaCount(s.providerRejected.items.length);
  const myPendingMeta = metaCount(myPendingItems.length);
  const myRejectedMeta = metaCount(myRejectedItems.length);

  const myApprovedMeta = metaCount(
    s.isSuper ? s.mine.items.length : myApprovedItems.length,
  );

  const mineApprovedPage = s.isSuper ? s.mine.page : s.mineApproved.page;
  const mineApprovedPages = s.isSuper ? s.mine.pages : s.mineApproved.pages;

  const mineApprovedPrev = useCallback(() => {
    (s.isSuper ? s.mine : s.mineApproved).setPage((p) => Math.max(1, p - 1));
  }, [s]);

  const mineApprovedNext = useCallback(() => {
    (s.isSuper ? s.mine : s.mineApproved).setPage((p) =>
      Math.min((s.isSuper ? s.mine : s.mineApproved).pages, p + 1),
    );
  }, [s]);

  return {
    ...s,
    ...a,

    anyError,
    previewHref,

    showAlarm,
    alarmCount: s.providerPending.items.length,

    myPendingItems,
    myApprovedItems,
    myRejectedItems,
    myApprovedItemsEffective,

    providerPendingMeta,
    providerApprovedMeta,
    providerRejectedMeta,
    myPendingMeta,
    myApprovedMeta,
    myRejectedMeta,

    rejectTitle: clean(s.rejectTarget?.title),

    mineApprovedPage,
    mineApprovedPages,
    mineApprovedPrevEffective: mineApprovedPrev,
    mineApprovedNextEffective: mineApprovedNext,

    providerPendingPrev: () => pagePrev(s.providerPending.setPage),
    providerPendingNext: () =>
      pageNext(s.providerPending.setPage, s.providerPending.pages),

    providerApprovedPrev: () => pagePrev(s.providerApproved.setPage),
    providerApprovedNext: () =>
      pageNext(s.providerApproved.setPage, s.providerApproved.pages),

    providerRejectedPrev: () => pagePrev(s.providerRejected.setPage),
    providerRejectedNext: () =>
      pageNext(s.providerRejected.setPage, s.providerRejected.pages),

    minePendingPrev: () => pagePrev(s.minePending.setPage),
    minePendingNext: () => pageNext(s.minePending.setPage, s.minePending.pages),

    mineRejectedPrev: () => pagePrev(s.mineRejected.setPage),
    mineRejectedNext: () =>
      pageNext(s.mineRejected.setPage, s.mineRejected.pages),

    toggleMinePendingSelectMode: () => s.setMinePendingSelectMode((p) => !p),
    toggleMineApprovedSelectMode: () => s.setMineApprovedSelectMode((p) => !p),
    toggleMineRejectedSelectMode: () => s.setMineRejectedSelectMode((p) => !p),
    toggleProvApprovedSelectMode: () => s.setProvApprovedSelectMode((p) => !p),
    toggleProvRejectedSelectMode: () => s.setProvRejectedSelectMode((p) => !p),

    onSubmitForReviewApprovedMine: a.onSubmitApprovedMine,
  };
}
