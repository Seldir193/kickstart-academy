// src/app/admin/(app)/coaches/hooks/useCoachesPageMutations.ts
"use client";

import { useRef, useState } from "react";
import type { Coach } from "../types";
import {
  approveCoach,
  createCoach,
  deleteCoach,
  rejectCoach,
  submitCoachForReview,
  updateCoach,
} from "../api";
import { buildUpdatePayload, getErrorMessage } from "../pageHelpers";

export function useCoachesPageMutations(args: {
  isSuper: boolean;
  isProviderItem: (c: Coach) => boolean;
  applySplitMoveProvider: (c: Coach) => void;
  applySplitUpsert: (c: Coach) => void;
  applySplitRemove: (slug: string) => void;
  applyMineUpsert: (c: Coach) => void;
  applyMineRemove: (slug: string) => void;
  resetSelections: () => void;
}) {
  const {
    isSuper,
    isProviderItem,
    applySplitMoveProvider,
    applySplitUpsert,
    applySplitRemove,
    applyMineUpsert,
    applyMineRemove,
    resetSelections,
  } = args;

  const [mutating, setMutating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [publishedBusySlug, setPublishedBusySlug] = useState<string | null>(
    null,
  );

  const confirmActionRef = useRef<(() => Promise<void>) | null>(null);

  async function runSafe<T>(fn: () => Promise<T>, fallback: string) {
    setMutating(true);
    try {
      const data = await fn();
      setNotice(null);
      return { ok: true as const, data };
    } catch (e) {
      setNotice(getErrorMessage(e) || fallback);
      return { ok: false as const };
    } finally {
      setMutating(false);
    }
  }

  function applyUpsert(updated: Coach) {
    if (isSuper) {
      if (isProviderItem(updated)) applySplitMoveProvider(updated);
      else applySplitUpsert(updated);
      return;
    }
    applyMineUpsert(updated);
  }

  function applyRemove(slug: string) {
    if (isSuper) applySplitRemove(slug);
    else applyMineRemove(slug);
  }

  async function handleCreate(values: Partial<Coach>) {
    const r = await runSafe(() => createCoach(values), "Create failed.");
    if (!r.ok) return null;
    resetSelections();
    applyUpsert(r.data);
    return r.data;
  }

  async function handleSave(slug: string, values: Partial<Coach>) {
    const payload = buildUpdatePayload(values, isSuper);
    const r = await runSafe(() => updateCoach(slug, payload), "Save failed.");
    if (!r.ok) return null;
    resetSelections();
    applyUpsert(r.data);
    return r.data;
  }

  async function handleApprove(slug: string) {
    const r = await runSafe(() => approveCoach(slug), "Approve failed.");
    if (!r.ok) return null;
    applySplitMoveProvider(r.data);
    return r.data;
  }

  async function handleReject(slug: string, reason: string) {
    const r = await runSafe(() => rejectCoach(slug, reason), "Reject failed.");
    if (!r.ok) return null;
    applyUpsert(r.data);
    return r.data;
  }

  async function handleSubmit(slug: string) {
    const r = await runSafe(() => submitCoachForReview(slug), "Submit failed.");
    if (!r.ok) return null;
    applyUpsert(r.data);
    return r.data;
  }

  async function handleDelete(slug: string): Promise<void> {
    const r = await runSafe(() => deleteCoach(slug), "Delete failed.");
    if (!r.ok) return;
    applyRemove(slug);
    resetSelections();
  }

  async function deleteMany(slugs: string[]): Promise<void> {
    const r = await runSafe(async () => {
      await Promise.all(slugs.map((s) => deleteCoach(s).catch(() => null)));
    }, "Delete failed.");

    if (!r.ok) return;

    slugs.forEach(applyRemove);
    resetSelections();
  }

  async function togglePublished(c: Coach, next: boolean) {
    const slug = String((c as any).slug || "").trim();
    if (!slug) return null;
    setPublishedBusySlug(slug);
    try {
      const r = await runSafe(
        () => updateCoach(slug, { published: next }),
        "Save failed.",
      );
      if (!r.ok) return null;
      applyUpsert(r.data);
      return r.data;
    } finally {
      setPublishedBusySlug(null);
    }
  }

  return {
    mutating,
    notice,
    setNotice,
    publishedBusySlug,
    confirmActionRef,
    runSafe,
    handleCreate,
    handleSave,
    handleApprove,
    handleReject,
    handleSubmit,
    handleDelete,
    deleteMany,
    togglePublished,
  };
}
