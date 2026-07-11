"use client";

import { useCallback, useState } from "react";
import { useFranchiseLocationActions } from "./useFranchiseLocationActions";
import { useFranchiseLocationDialogs } from "./useFranchiseLocationDialogs";
import { useFranchiseLocationsCollection, useLocationPagination } from "./useFranchiseLocationsCollection";
import { useFranchiseLocationSelection } from "./useFranchiseLocationSelection";

type Notice = { type: "ok" | "error"; text: string };

export function useFranchiseLocationsPage() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const toast = useCallback((type: Notice["type"], text: string, ms: number) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), ms);
  }, []);
  const toastOk = useCallback((text: string) => toast("ok", text, 4500), [toast]);
  const toastErr = useCallback((text: string) => toast("error", text, 6000), [toast]);
  const selection = useFranchiseLocationSelection();
  const collection = useFranchiseLocationsCollection(toastErr);
  const pagination = useLocationPagination(collection.filtered, collection.q, selection.resetSelection);
  const dialogs = useFranchiseLocationDialogs();
  const actions = useFranchiseLocationActions({ edit: dialogs.edit, rejectTarget: dialogs.rejectTarget,
    loadAll: collection.loadAll, setOpenDialog: dialogs.setOpenDialog, t: collection.t, toastOk, toastErr });
  const move = (key: string, direction: 1 | -1) => () => pagination.move(key, direction);

  return {
    notice, loading: collection.loading, err: collection.err, q: collection.q, setQ: collection.setQ,
    sort: collection.sort, setSort: collection.setSort, superAdmin: collection.superAdmin,
    openDialog: dialogs.openDialog, edit: dialogs.edit, openCreate: dialogs.openCreate,
    openEdit: dialogs.openEdit, closeDialog: dialogs.closeDialog, rejectOpen: dialogs.rejectOpen,
    openReject: dialogs.openReject, closeRejectDialog: dialogs.closeRejectDialog,
    submitReject: actions.submitReject, infoOpen: dialogs.infoOpen, infoItem: dialogs.infoItem,
    openInfo: dialogs.openInfo, closeInfoDialog: dialogs.closeInfoDialog,
    publishedBusyId: actions.publishedBusyId, togglePublished: actions.togglePublished,
    minePendingAllCount: collection.lists.mp.length, mineApprovedAllCount: collection.lists.ma.length,
    mineRejectedAllCount: collection.lists.mr.length, provPendingAllCount: collection.lists.pp.length,
    provApprovedAllCount: collection.lists.pa.length, provRejectedAllCount: collection.lists.pr.length,
    pagMinePending: pagination.paged.mp, pagMineApproved: pagination.paged.ma,
    pagMineRejected: pagination.paged.mr, pagProvPending: pagination.paged.pp,
    pagProvApproved: pagination.paged.pa, pagProvRejected: pagination.paged.pr,
    pageMinePending: pagination.pages.mp, pageMineApproved: pagination.pages.ma,
    pageMineRejected: pagination.pages.mr, pageProvPending: pagination.pages.pp,
    pageProvApproved: pagination.pages.pa, pageProvRejected: pagination.pages.pr,
    ...selection,
    prevMinePending: move("mp", -1), nextMinePending: move("mp", 1),
    prevMineApproved: move("ma", -1), nextMineApproved: move("ma", 1),
    prevMineRejected: move("mr", -1), nextMineRejected: move("mr", 1),
    prevProvPending: move("pp", -1), nextProvPending: move("pp", 1),
    prevProvApproved: move("pa", -1), nextProvApproved: move("pa", 1),
    prevProvRejected: move("pr", -1), nextProvRejected: move("pr", 1),
    saveLocation: actions.saveLocation, removeMineOne: actions.removeMineOne,
    deleteManyMine: actions.deleteManyMine, deleteManyAdmin: actions.deleteManyAdmin,
    deleteOneAdmin: actions.deleteOneAdmin, approveOne: actions.approveOne, submitMine: actions.submitMine,
  };
}
