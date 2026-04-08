//src\app\admin\(app)\news\newsAdmin\useNewsAdminActions.ts
"use client";

import { useCallback } from "react";
import type { News } from "../types";
import {
  approveNews,
  createNews,
  deleteNewsRecord,
  rejectNews,
  submitNewsForReview,
  toggleNewsPublished,
  updateNews,
  uploadNewsFile,
} from "../api";
import type { ReloadKey } from "./helpers";
import { delay, getId, hasDraftForReview } from "./helpers";

async function runMutating(
  setBusy: (v: boolean) => void,
  fn: () => Promise<void>,
) {
  setBusy(true);
  try {
    await fn();
  } finally {
    setBusy(false);
  }
}

async function saveOne(n: News) {
  const id = getId(n);
  if (id) return await updateNews(id, n as any);
  return await createNews(n as any);
}

export function useNewsAdminActions(args: {
  isSuper: boolean;
  setMutating: (v: boolean) => void;
  setPublishedBusyId: (v: string | null) => void;
  reloadMap: Record<ReloadKey, { reload: () => Promise<void> }>;

  setCreateOpen: (v: boolean) => void;
  setEditItem: (v: News | null) => void;

  setRejectOpen: (v: boolean) => void;
  setRejectTarget: (v: News | null) => void;
  rejectTarget: News | null;

  setInfoOpen: (v: boolean) => void;
  setInfoTarget: (v: News | null) => void;

  resetSelections: () => void;
}) {
  const reloadViews = useCallback(
    async (keys: ReloadKey[]) => {
      for (const k of keys) {
        const slot = args.reloadMap[k];
        if (!slot) continue;
        try {
          await slot.reload();
          await delay(60);
        } catch {}
      }
    },
    [args.reloadMap],
  );

  const reloadForRole = useCallback(async () => {
    if (args.isSuper) {
      return await reloadViews([
        "mine",
        "provider_pending",
        "provider_approved",
        "provider_rejected",
      ]);
    }
    await reloadViews(["mine_pending", "mine_approved", "mine_rejected"]);
  }, [args.isSuper, reloadViews]);

  const onSave = useCallback(
    async (n: News) => {
      await runMutating(args.setMutating, async () => {
        await saveOne(n);
        await reloadForRole();
        args.resetSelections();
      });
    },
    [args, reloadForRole],
  );

  const onDeleteById = useCallback(
    async (id: string) => {
      await runMutating(args.setMutating, async () => {
        await deleteNewsRecord(id);
        await reloadForRole();
      });
    },
    [args, reloadForRole],
  );

  const onDeleteOne = useCallback(
    async (n: News) => {
      const id = getId(n);
      if (!id) return;
      await onDeleteById(id);
    },
    [onDeleteById],
  );

  const onApprove = useCallback(
    async (n: News) => {
      const id = getId(n);
      if (!id) return;
      await runMutating(args.setMutating, async () => {
        await approveNews(id);
        await reloadViews(["provider_pending", "provider_approved"]);
      });
    },
    [args.setMutating, reloadViews],
  );

  const onAskReject = useCallback(
    (n: News) => {
      args.setRejectTarget(n);
      args.setRejectOpen(true);
    },
    [args],
  );

  const onSubmitReject = useCallback(
    async (reason: string) => {
      const id = getId(args.rejectTarget);
      if (!id) return;

      await runMutating(args.setMutating, async () => {
        await rejectNews(id, reason);
        await reloadViews(
          args.isSuper
            ? ["provider_pending", "provider_approved", "provider_rejected"]
            : ["mine_pending", "mine_approved", "mine_rejected"],
        );
        args.setRejectOpen(false);
        args.setRejectTarget(null);
      });
    },
    [args, reloadViews],
  );

  const onResubmitMine = useCallback(
    async (n: News) => {
      const id = getId(n);
      if (!id) return;
      await runMutating(args.setMutating, async () => {
        await submitNewsForReview(id);
        await reloadViews(["mine_rejected", "mine_pending"]);
      });
    },
    [args.setMutating, reloadViews],
  );

  const onSubmitApprovedMine = useCallback(
    async (n: News) => {
      const id = getId(n);
      if (!id || !hasDraftForReview(n)) return;
      await runMutating(args.setMutating, async () => {
        await submitNewsForReview(id);
        await reloadViews(["mine_approved", "mine_pending"]);
      });
    },
    [args.setMutating, reloadViews],
  );

  const onDeleteMany = useCallback(
    async (ids: string[]) => {
      if (!ids.length) return;
      await runMutating(args.setMutating, async () => {
        await Promise.all(ids.map((id) => deleteNewsRecord(id)));
        await reloadForRole();
      });
    },
    [args.setMutating, reloadForRole],
  );

  const onTogglePublished = useCallback(
    async (n: News, next: boolean) => {
      const id = getId(n);
      if (!id) return;
      args.setPublishedBusyId(id);
      try {
        await toggleNewsPublished(id, next);
        if (args.isSuper) await reloadViews(["mine", "provider_approved"]);
        else await reloadViews(["mine_approved"]);
      } finally {
        args.setPublishedBusyId(null);
      }
    },
    [args, reloadViews],
  );

  const onInfo = useCallback(
    (n: News) => {
      args.setInfoTarget(n);
      args.setInfoOpen(true);
    },
    [args],
  );

  const onOpenCreate = useCallback(() => {
    args.resetSelections();
    args.setCreateOpen(true);
  }, [args]);

  const onOpenEdit = useCallback(
    (n: News) => {
      args.setEditItem(n);
    },
    [args],
  );

  const onCloseCreate = useCallback(() => args.setCreateOpen(false), [args]);
  const onCloseEdit = useCallback(() => args.setEditItem(null), [args]);

  const onCloseReject = useCallback(() => {
    args.setRejectOpen(false);
    args.setRejectTarget(null);
  }, [args]);

  const onCloseInfo = useCallback(() => {
    args.setInfoOpen(false);
    args.setInfoTarget(null);
  }, [args]);

  return {
    onSave,
    onDeleteById,
    onDeleteOne,
    onDeleteMany,
    onApprove,
    onAskReject,
    onSubmitReject,
    onResubmitMine,
    onSubmitApprovedMine,
    onTogglePublished,
    onInfo,
    onOpenCreate,
    onOpenEdit,
    onCloseCreate,
    onCloseEdit,
    onCloseReject,
    onCloseInfo,
    upload: uploadNewsFile,
  };
}
