"use client";

import { useCallback, useState } from "react";
import type { TFunction } from "i18next";
import type { FranchiseLocation, LocationPayload } from "../types";
import {
  approve,
  createMine,
  deleteAdmin,
  deleteMine,
  reject,
  setPublished,
  submitForReview,
  updateMine,
} from "../franchise_locations.api";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";

type Args = {
  edit: FranchiseLocation | null;
  rejectTarget: FranchiseLocation | null;
  loadAll: (silent?: boolean) => Promise<void>;
  setOpenDialog: (open: boolean) => void;
  t: TFunction;
  toastOk: (text: string) => void;
  toastErr: (text: string) => void;
};

export function useFranchiseLocationActions(args: Args) {
  const { edit, rejectTarget, loadAll, setOpenDialog, t, toastOk, toastErr } =
    args;
  const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);
  const saveLocation = useCallback(
    async (payload: LocationPayload) => {
      try {
        if (edit?.id) await updateMine(edit.id, payload);
        else await createMine(payload);
        toastOk(
          toastText(
            t,
            edit?.id
              ? "common.admin.franchiseLocations.toast.locationSaved"
              : "common.admin.franchiseLocations.toast.locationCreated",
          ),
        );
        setOpenDialog(false);
        await loadAll(true);
      } catch (error: unknown) {
        toastErr(
          toastErrorMessage(
            t,
            error,
            "common.admin.franchiseLocations.toast.savingFailed",
          ),
        );
        throw error;
      }
    },
    [edit, loadAll, setOpenDialog, t, toastErr, toastOk],
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
      await Promise.all(ids.map(deleteMine));
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
      await Promise.all(ids.map(deleteAdmin));
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
    async (item: FranchiseLocation) => {
      await deleteAdmin(item.id);
      toastOk(toastText(t, "common.admin.franchiseLocations.toast.deleted"));
      await loadAll(true);
    },
    [loadAll, t, toastOk],
  );
  const runAction = useCallback(
    async (action: () => Promise<unknown>, okKey: string, errorKey: string) => {
      try {
        await action();
        toastOk(toastText(t, `common.admin.franchiseLocations.toast.${okKey}`));
        await loadAll(true);
      } catch (error: unknown) {
        toastErr(
          toastErrorMessage(
            t,
            error,
            `common.admin.franchiseLocations.toast.${errorKey}`,
          ),
        );
      }
    },
    [loadAll, t, toastErr, toastOk],
  );

  const approveOne = useCallback(
    async (item: FranchiseLocation) =>
      runAction(() => approve(item.id), "locationApproved", "approveFailed"),
    [runAction],
  );
  const submitMine = useCallback(
    async (item: FranchiseLocation) =>
      runAction(
        () => submitForReview(item.id),
        "changesSubmitted",
        "submitFailed",
      ),
    [runAction],
  );
  const submitReject = useCallback(
    async (reason: string) => {
      if (rejectTarget)
        await runAction(
          () => reject(rejectTarget.id, reason),
          "locationRejected",
          "rejectFailed",
        );
    },
    [rejectTarget, runAction],
  );
  const togglePublished = useCallback(
    async (item: FranchiseLocation, next: boolean) => {
      const id = String(item.id || "");
      if (!id) return;
      setPublishedBusyId(id);
      try {
        await setPublished(id, next);
        await loadAll(true);
      } catch (error: unknown) {
        toastErr(
          toastErrorMessage(
            t,
            error,
            "common.admin.franchiseLocations.toast.toggleFailed",
          ),
        );
      } finally {
        setPublishedBusyId(null);
      }
    },
    [loadAll, t, toastErr],
  );
  return {
    publishedBusyId,
    togglePublished,
    saveLocation,
    removeMineOne,
    deleteManyMine,
    deleteManyAdmin,
    deleteOneAdmin,
    approveOne,
    submitReject,
    submitMine,
  };
}
