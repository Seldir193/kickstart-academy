"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { Coach } from "../../types";
import { useCoachesData } from "../../hooks/useCoachesData";
import { useCoachesPageMutations } from "../../hooks/useCoachesPageMutations";
import { useCoachesPageState } from "../../hooks/useCoachesPageState";
import { cleanStr } from "../../pageHelpers";
import type { CoachBusyState, CoachDialogState, CoachRefs } from "./types";

function getCoachMeta(me: unknown, t: TFunction) {
  const isSuper = Boolean((me as any)?.isSuperAdmin);
  const meId = cleanStr((me as any)?.id);
  const fallback = t("common.admin.coaches.page.meLabel");
  const meLabel = cleanStr((me as any)?.fullName) || fallback;
  return { isSuper, meId, meLabel };
}

function isOtherProviderItem(coach: Coach, meId: string) {
  const pid = cleanStr((coach as any)?.providerId);
  if (!pid) return false;
  if (!meId) return true;
  return pid !== meId;
}

function coachRowId(coach: Coach) {
  return cleanStr((coach as any)?.slug) || cleanStr((coach as any)?.id);
}

function useCoachRefs(): CoachRefs {
  const approvedProvidersToggleRef = useRef<HTMLButtonElement | null>(null);
  const rejectedProvidersToggleRef = useRef<HTMLButtonElement | null>(null);
  const myPendingToggleRef = useRef<HTMLButtonElement | null>(null);
  const myApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
  const myRejectedToggleRef = useRef<HTMLButtonElement | null>(null);
  return {
    approvedProvidersToggleRef,
    rejectedProvidersToggleRef,
    myPendingToggleRef,
    myApprovedToggleRef,
    myRejectedToggleRef,
  };
}

function useCoachBusyState(): CoachBusyState {
  const [pendingBusySlug, setPendingBusySlug] = useState<string | null>(null);
  const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);
  return {
    pendingBusySlug,
    setPendingBusySlug,
    publishedBusyId,
    setPublishedBusyId,
  };
}

function useCoachDialogState(): CoachDialogState {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Coach | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coach | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Coach | null>(null);
  const [rejectInfoOpen, setRejectInfoOpen] = useState(false);
  const [rejectInfoTarget, setRejectInfoTarget] = useState<Coach | null>(null);
  const [publishedInfoOpen, setPublishedInfoOpen] = useState(false);
  const [publishedInfoTarget, setPublishedInfoTarget] = useState<Coach | null>(
    null,
  );
  return {
    createOpen,
    setCreateOpen,
    editItem,
    setEditItem,
    deleteOpen,
    setDeleteOpen,
    deleteTarget,
    setDeleteTarget,
    rejectOpen,
    setRejectOpen,
    rejectTarget,
    setRejectTarget,
    rejectInfoOpen,
    setRejectInfoOpen,
    rejectInfoTarget,
    setRejectInfoTarget,
    publishedInfoOpen,
    setPublishedInfoOpen,
    publishedInfoTarget,
    setPublishedInfoTarget,
  };
}

function syncSplitState(
  isSuper: boolean,
  resp: unknown,
  state: ReturnType<typeof useCoachesPageState>,
) {
  if (!isSuper) {
    state.setSplitFromResponse(null);
    return;
  }
  if (resp) state.setSplitFromResponse(resp);
}

function syncMineState(
  isSuper: boolean,
  items: Coach[],
  state: ReturnType<typeof useCoachesPageState>,
) {
  if (isSuper) return;
  state.setMineFromItems(Array.isArray(items) ? items : []);
}

function useSyncedCoachState(
  isSuper: boolean,
  meId: string,
  resp: unknown,
  items: Coach[],
) {
  const state = useCoachesPageState({ isSuper, meId });
  useEffect(() => syncSplitState(isSuper, resp, state), [isSuper, resp]);
  useEffect(() => syncMineState(isSuper, items, state), [isSuper, items]);
  return state;
}

function useCoachMutations(
  isSuper: boolean,
  meId: string,
  state: ReturnType<typeof useCoachesPageState>,
) {
  return useCoachesPageMutations({
    isSuper,
    isProviderItem: (coach) => isOtherProviderItem(coach, meId),
    applySplitMoveProvider: state.applySplitMoveProvider,
    applySplitUpsert: state.applySplitUpsert,
    applySplitRemove: state.applySplitRemove,
    applyMineUpsert: state.applyMineUpsert,
    applyMineRemove: state.applyMineRemove,
    resetSelections: state.resetSelections,
  });
}

export function useCoachesAdminPage() {
  const { t } = useTranslation();
  const { me, items, resp, loading, error } = useCoachesData();
  const meta = getCoachMeta(me, t);
  const state = useSyncedCoachState(meta.isSuper, meta.meId, resp, items);
  const muts = useCoachMutations(meta.isSuper, meta.meId, state);
  const dialogs = useCoachDialogState();
  const busy = useCoachBusyState();
  const refs = useCoachRefs();
  const pendingCount = meta.isSuper ? state.providersPendingAll.length : 0;
  return {
    state,
    muts,
    dialogs,
    busy,
    refs,
    isSuper: meta.isSuper,
    loading,
    error,
    meLabel: meta.meLabel,
    pendingCount,
    openDelete: (coach: Coach) => openDelete(dialogs, coach),
    togglePublished: (coach: Coach, next: boolean) =>
      togglePublished(coach, next, muts, busy),
  };
}

function openDelete(dialogs: CoachDialogState, coach: Coach) {
  dialogs.setDeleteTarget(coach);
  dialogs.setDeleteOpen(true);
}

async function togglePublished(
  coach: Coach,
  next: boolean,
  muts: ReturnType<typeof useCoachesPageMutations>,
  busy: CoachBusyState,
) {
  const id = coachRowId(coach);
  if (!id || muts.mutating) return;
  busy.setPublishedBusyId(id);
  try {
    await Promise.resolve(muts.togglePublished(coach, next));
  } finally {
    busy.setPublishedBusyId(null);
  }
}
