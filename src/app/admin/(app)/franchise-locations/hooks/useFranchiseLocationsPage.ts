"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FranchiseLocation, LocationPayload } from "../types";
import {
  clean,
  includesText,
  paginate,
  sortLocations,
  type SortKey,
} from "../franchise_locations.utils";
import {
  approve,
  createMine,
  deleteAdmin,
  deleteMine,
  fetchAdmin,
  fetchMe,
  reject,
  setPublished,
  submitForReview,
  updateMine,
} from "../franchise_locations.api";
import { isSuperAdminUser } from "../page.helpers";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";

type Notice = { type: "ok" | "error"; text: string };
const pageSize = 8;

function safeItems(d: any): FranchiseLocation[] {
  return Array.isArray(d?.items) ? d.items : [];
}

function buildHaystack(x: FranchiseLocation) {
  return [
    x.licenseeFirstName,
    x.licenseeLastName,
    x.country,
    x.city,
    x.state,
    x.address,
    x.zip,
    x.website,
    x.emailPublic,
    x.phonePublic,
    x.rejectionReason,
    x.status,
    x.ownerName,
    x.ownerEmail,
    x.ownerUser?.fullName,
    x.ownerUser?.email,
  ]
    .filter(Boolean)
    .join(" | ");
}

function applySearch(arr: FranchiseLocation[], q: string) {
  const query = clean(q);
  if (!query) return arr;
  return arr.filter((x) => includesText(buildHaystack(x), query));
}

async function loadView(view: string) {
  const qs = `view=${encodeURIComponent(view)}`;
  const d = await fetchAdmin(qs);
  return safeItems(d);
}

function clampPage(n: number, pages: number, dir: 1 | -1) {
  const next = n + dir;
  if (next < 1) return 1;
  if (next > pages) return pages;
  return next;
}

export function useFranchiseLocationsPage() {
  const { t } = useTranslation();
  const [meUser, setMeUser] = useState<{
    role?: string | null;
    isSuperAdmin?: boolean;
  } | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const [openDialog, setOpenDialog] = useState(false);
  const [edit, setEdit] = useState<FranchiseLocation | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<FranchiseLocation | null>(
    null,
  );

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoItem, setInfoItem] = useState<FranchiseLocation | null>(null);

  const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);

  const [minePendingAll, setMinePendingAll] = useState<FranchiseLocation[]>([]);
  const [mineApprovedAll, setMineApprovedAll] = useState<FranchiseLocation[]>(
    [],
  );
  const [mineRejectedAll, setMineRejectedAll] = useState<FranchiseLocation[]>(
    [],
  );

  const [provPendingAll, setProvPendingAll] = useState<FranchiseLocation[]>([]);
  const [provApprovedAll, setProvApprovedAll] = useState<FranchiseLocation[]>(
    [],
  );
  const [provRejectedAll, setProvRejectedAll] = useState<FranchiseLocation[]>(
    [],
  );

  const [pageMinePending, setPageMinePending] = useState(1);
  const [pageMineApproved, setPageMineApproved] = useState(1);
  const [pageMineRejected, setPageMineRejected] = useState(1);

  const [pageProvPending, setPageProvPending] = useState(1);
  const [pageProvApproved, setPageProvApproved] = useState(1);
  const [pageProvRejected, setPageProvRejected] = useState(1);

  const [minePendingSelectMode, setMinePendingSelectMode] = useState(false);
  const [mineApprovedSelectMode, setMineApprovedSelectMode] = useState(false);
  const [mineRejectedSelectMode, setMineRejectedSelectMode] = useState(false);

  const [provApprovedSelectMode, setProvApprovedSelectMode] = useState(false);
  const [provRejectedSelectMode, setProvRejectedSelectMode] = useState(false);

  const minePendingToggleRef = useRef<HTMLButtonElement | null>(null);
  const mineApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
  const mineRejectedToggleRef = useRef<HTMLButtonElement | null>(null);
  const provApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
  const provRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

  const didLoadOnce = useRef(false);

  const superAdmin = useMemo(() => isSuperAdminUser(meUser), [meUser]);

  const toast = useCallback(
    (type: "ok" | "error", text: string, ms: number) => {
      setNotice({ type, text });
      window.setTimeout(() => setNotice(null), ms);
    },
    [],
  );

  const toastOk = useCallback(
    (text: string) => toast("ok", text, 4500),
    [toast],
  );
  const toastErr = useCallback(
    (text: string) => toast("error", text, 6000),
    [toast],
  );

  const openCreate = useCallback(() => {
    setEdit(null);
    setOpenDialog(true);
  }, []);

  const openEdit = useCallback((it: FranchiseLocation) => {
    setEdit(it);
    setOpenDialog(true);
  }, []);

  const closeDialog = useCallback(() => setOpenDialog(false), []);
  const openInfo = useCallback((it: FranchiseLocation) => {
    setInfoItem(it);
    setInfoOpen(true);
  }, []);

  const closeInfoDialog = useCallback(() => setInfoOpen(false), []);
  const openReject = useCallback((it: FranchiseLocation) => {
    setRejectTarget(it);
    setRejectOpen(true);
  }, []);

  const closeRejectDialog = useCallback(() => {
    setRejectOpen(false);
    setRejectTarget(null);
  }, []);

  const resetPagingAndSelection = useCallback(() => {
    setPageMinePending(1);
    setPageMineApproved(1);
    setPageMineRejected(1);
    setPageProvPending(1);
    setPageProvApproved(1);
    setPageProvRejected(1);
    setMinePendingSelectMode(false);
    setMineApprovedSelectMode(false);
    setMineRejectedSelectMode(false);
    setProvApprovedSelectMode(false);
    setProvRejectedSelectMode(false);
  }, []);

  const assignLists = useCallback(
    (
      minePending: FranchiseLocation[],
      mineApproved: FranchiseLocation[],
      mineRejected: FranchiseLocation[],
      provPending: FranchiseLocation[],
      provApproved: FranchiseLocation[],
      provRejected: FranchiseLocation[],
    ) => {
      setMinePendingAll(sortLocations(minePending, sort));
      setMineApprovedAll(sortLocations(mineApproved, sort));
      setMineRejectedAll(sortLocations(mineRejected, sort));
      setProvPendingAll(sortLocations(provPending, sort));
      setProvApprovedAll(sortLocations(provApproved, sort));
      setProvRejectedAll(sortLocations(provRejected, sort));
    },
    [sort],
  );

  const loadAll = useCallback(
    async (silent?: boolean) => {
      if (!silent) {
        setLoading(true);
        setErr(null);
      }
      try {
        const me = await fetchMe();
        setMeUser(me);
        const superFlag = isSuperAdminUser(me);
        const tasks = superFlag
          ? [
              Promise.resolve([]),
              loadView("mine_approved"),
              Promise.resolve([]),
              loadView("provider_pending"),
              loadView("provider_approved"),
              loadView("provider_rejected"),
            ]
          : [
              loadView("mine_pending"),
              loadView("mine_approved"),
              loadView("mine_rejected"),
              Promise.resolve([]),
              Promise.resolve([]),
              Promise.resolve([]),
            ];
        const [mp, ma, mr, pp, pa, pr] = await Promise.all(tasks);
        assignLists(mp, ma, mr, pp, pa, pr);
      } catch (e: any) {
        const msg = toastErrorMessage(
          t,
          e,
          "common.admin.franchiseLocations.toast.loadFailed",
        );
        setErr(msg);
        toastErr(msg);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [assignLists, t, toastErr],
  );

  useEffect(() => {
    if (!didLoadOnce.current) {
      didLoadOnce.current = true;
      loadAll(false);
      return;
    }
    loadAll(true);
  }, [loadAll]);

  useEffect(() => resetPagingAndSelection(), [q, resetPagingAndSelection]);

  const minePending = useMemo(
    () => applySearch(minePendingAll, q),
    [minePendingAll, q],
  );
  const mineApproved = useMemo(
    () => applySearch(mineApprovedAll, q),
    [mineApprovedAll, q],
  );
  const mineRejected = useMemo(
    () => applySearch(mineRejectedAll, q),
    [mineRejectedAll, q],
  );
  const provPending = useMemo(
    () => applySearch(provPendingAll, q),
    [provPendingAll, q],
  );
  const provApproved = useMemo(
    () => applySearch(provApprovedAll, q),
    [provApprovedAll, q],
  );
  const provRejected = useMemo(
    () => applySearch(provRejectedAll, q),
    [provRejectedAll, q],
  );

  const pagMinePending = useMemo(
    () => paginate(minePending, pageMinePending, pageSize),
    [minePending, pageMinePending],
  );
  const pagMineApproved = useMemo(
    () => paginate(mineApproved, pageMineApproved, pageSize),
    [mineApproved, pageMineApproved],
  );
  const pagMineRejected = useMemo(
    () => paginate(mineRejected, pageMineRejected, pageSize),
    [mineRejected, pageMineRejected],
  );
  const pagProvPending = useMemo(
    () => paginate(provPending, pageProvPending, pageSize),
    [provPending, pageProvPending],
  );
  const pagProvApproved = useMemo(
    () => paginate(provApproved, pageProvApproved, pageSize),
    [provApproved, pageProvApproved],
  );
  const pagProvRejected = useMemo(
    () => paginate(provRejected, pageProvRejected, pageSize),
    [provRejected, pageProvRejected],
  );

  const saveLocation = useCallback(
    async (payload: LocationPayload) => {
      try {
        if (edit?.id) await updateMine(edit.id, payload);
        else await createMine(payload);
        toastOk(
          edit?.id
            ? toastText(
                t,
                "common.admin.franchiseLocations.toast.locationSaved",
              )
            : toastText(
                t,
                "common.admin.franchiseLocations.toast.locationCreated",
              ),
        );
        setOpenDialog(false);
        await loadAll(true);
      } catch (e: any) {
        toastErr(
          toastErrorMessage(
            t,
            e,
            "common.admin.franchiseLocations.toast.savingFailed",
          ),
        );
        throw e;
      }
    },
    [edit, loadAll, t, toastErr, toastOk],
  );

  const removeMineOne = useCallback(
    async (id: string) => {
      await deleteMine(id);
      toastOk(
        toastText(t, "common.admin.franchiseLocations.toast.locationDeleted"),
      );
      await loadAll(true);
    },
    [loadAll, t, toastOk],
  );

  const deleteManyMine = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteMine(id)));
      toastOk(
        t("common.admin.franchiseLocations.toast.locationsDeleted", {
          count: ids.length,
        }),
      );
      await loadAll(true);
    },
    [loadAll, t, toastOk],
  );

  const deleteManyAdmin = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteAdmin(id)));
      toastOk(
        t("common.admin.franchiseLocations.toast.locationsDeleted", {
          count: ids.length,
        }),
      );
      await loadAll(true);
    },
    [loadAll, t, toastOk],
  );

  const deleteOneAdmin = useCallback(
    async (it: FranchiseLocation) => {
      await deleteAdmin(it.id);
      toastOk(toastText(t, "common.admin.franchiseLocations.toast.deleted"));
      await loadAll(true);
    },
    [loadAll, t, toastOk],
  );

  const approveOne = useCallback(
    async (it: FranchiseLocation) => {
      try {
        await approve(it.id);
        toastOk(
          toastText(
            t,
            "common.admin.franchiseLocations.toast.locationApproved",
          ),
        );
        await loadAll(true);
      } catch (e: any) {
        toastErr(
          toastErrorMessage(
            t,
            e,
            "common.admin.franchiseLocations.toast.approveFailed",
          ),
        );
      }
    },
    [loadAll, t, toastErr, toastOk],
  );

  const submitReject = useCallback(
    async (reason: string) => {
      if (!rejectTarget) return;
      try {
        await reject(rejectTarget.id, reason);
        toastOk(
          toastText(
            t,
            "common.admin.franchiseLocations.toast.locationRejected",
          ),
        );
        await loadAll(true);
      } catch (e: any) {
        toastErr(
          toastErrorMessage(
            t,
            e,
            "common.admin.franchiseLocations.toast.rejectFailed",
          ),
        );
      }
    },
    [loadAll, rejectTarget, t, toastErr, toastOk],
  );

  const submitMine = useCallback(
    async (it: FranchiseLocation) => {
      try {
        await submitForReview(it.id);
        toastOk(
          toastText(
            t,
            "common.admin.franchiseLocations.toast.changesSubmitted",
          ),
        );
        await loadAll(true);
      } catch (e: any) {
        toastErr(
          toastErrorMessage(
            t,
            e,
            "common.admin.franchiseLocations.toast.submitFailed",
          ),
        );
      }
    },
    [loadAll, t, toastErr, toastOk],
  );

  const togglePublished = useCallback(
    async (it: FranchiseLocation, next: boolean) => {
      const id = String(it.id || "");
      if (!id) return;
      setPublishedBusyId(id);
      try {
        await setPublished(id, next);
        await loadAll(true);
      } catch (e: any) {
        toastErr(
          toastErrorMessage(
            t,
            e,
            "common.admin.franchiseLocations.toast.toggleFailed",
          ),
        );
      } finally {
        setPublishedBusyId(null);
      }
    },
    [loadAll, t, toastErr],
  );

  const toggleMinePendingSelectMode = useCallback(
    () => setMinePendingSelectMode((v) => !v),
    [],
  );
  const toggleMineApprovedSelectMode = useCallback(
    () => setMineApprovedSelectMode((v) => !v),
    [],
  );
  const toggleMineRejectedSelectMode = useCallback(
    () => setMineRejectedSelectMode((v) => !v),
    [],
  );
  const toggleProvApprovedSelectMode = useCallback(
    () => setProvApprovedSelectMode((v) => !v),
    [],
  );
  const toggleProvRejectedSelectMode = useCallback(
    () => setProvRejectedSelectMode((v) => !v),
    [],
  );

  const prevMinePending = useCallback(
    () => setPageMinePending((p) => clampPage(p, pagMinePending.pages, -1)),
    [pagMinePending.pages],
  );
  const nextMinePending = useCallback(
    () => setPageMinePending((p) => clampPage(p, pagMinePending.pages, 1)),
    [pagMinePending.pages],
  );
  const prevMineApproved = useCallback(
    () => setPageMineApproved((p) => clampPage(p, pagMineApproved.pages, -1)),
    [pagMineApproved.pages],
  );
  const nextMineApproved = useCallback(
    () => setPageMineApproved((p) => clampPage(p, pagMineApproved.pages, 1)),
    [pagMineApproved.pages],
  );
  const prevMineRejected = useCallback(
    () => setPageMineRejected((p) => clampPage(p, pagMineRejected.pages, -1)),
    [pagMineRejected.pages],
  );
  const nextMineRejected = useCallback(
    () => setPageMineRejected((p) => clampPage(p, pagMineRejected.pages, 1)),
    [pagMineRejected.pages],
  );

  const prevProvPending = useCallback(
    () => setPageProvPending((p) => clampPage(p, pagProvPending.pages, -1)),
    [pagProvPending.pages],
  );
  const nextProvPending = useCallback(
    () => setPageProvPending((p) => clampPage(p, pagProvPending.pages, 1)),
    [pagProvPending.pages],
  );
  const prevProvApproved = useCallback(
    () => setPageProvApproved((p) => clampPage(p, pagProvApproved.pages, -1)),
    [pagProvApproved.pages],
  );
  const nextProvApproved = useCallback(
    () => setPageProvApproved((p) => clampPage(p, pagProvApproved.pages, 1)),
    [pagProvApproved.pages],
  );
  const prevProvRejected = useCallback(
    () => setPageProvRejected((p) => clampPage(p, pagProvRejected.pages, -1)),
    [pagProvRejected.pages],
  );
  const nextProvRejected = useCallback(
    () => setPageProvRejected((p) => clampPage(p, pagProvRejected.pages, 1)),
    [pagProvRejected.pages],
  );

  return {
    notice,
    loading,
    err,
    q,
    setQ,
    sort,
    setSort,
    superAdmin,

    openDialog,
    edit,
    openCreate,
    openEdit,
    closeDialog,

    rejectOpen,
    openReject,
    closeRejectDialog,
    submitReject,

    infoOpen,
    infoItem,
    openInfo,
    closeInfoDialog,

    publishedBusyId,
    togglePublished,

    minePendingAllCount: minePendingAll.length,
    mineApprovedAllCount: mineApprovedAll.length,
    mineRejectedAllCount: mineRejectedAll.length,
    provPendingAllCount: provPendingAll.length,
    provApprovedAllCount: provApprovedAll.length,
    provRejectedAllCount: provRejectedAll.length,

    pagMinePending,
    pagMineApproved,
    pagMineRejected,
    pagProvPending,
    pagProvApproved,
    pagProvRejected,

    pageMinePending,
    pageMineApproved,
    pageMineRejected,
    pageProvPending,
    pageProvApproved,
    pageProvRejected,

    minePendingSelectMode,
    mineApprovedSelectMode,
    mineRejectedSelectMode,
    provApprovedSelectMode,
    provRejectedSelectMode,

    toggleMinePendingSelectMode,
    toggleMineApprovedSelectMode,
    toggleMineRejectedSelectMode,
    toggleProvApprovedSelectMode,
    toggleProvRejectedSelectMode,

    minePendingToggleRef,
    mineApprovedToggleRef,
    mineRejectedToggleRef,
    provApprovedToggleRef,
    provRejectedToggleRef,

    prevMinePending,
    nextMinePending,
    prevMineApproved,
    nextMineApproved,
    prevMineRejected,
    nextMineRejected,
    prevProvPending,
    nextProvPending,
    prevProvApproved,
    nextProvApproved,
    prevProvRejected,
    nextProvRejected,

    saveLocation,
    removeMineOne,
    deleteManyMine,
    deleteManyAdmin,
    deleteOneAdmin,
    approveOne,
    submitMine,
  };
}
