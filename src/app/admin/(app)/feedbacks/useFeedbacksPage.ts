import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import type { Feedback } from "./types";
import {
  createFeedback,
  deleteFeedback,
  fetchFeedbacks,
  updateFeedback,
  uploadFeedbackImage,
} from "./api";
import {
  cloneFeedback,
  getFeedbackId,
  isDuplicateFeedback,
  sortFeedbacks,
} from "./helpers";

export type FeedbackDialogMode = "create" | "edit";

export function useFeedbacksPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyItemId, setBusyItemId] = useState("");
  const [error, setError] = useState("");
  const [dialogMode, setDialogMode] = useState<FeedbackDialogMode | null>(null);
  const [dialogItem, setDialogItem] = useState<Feedback | null>(null);
  const sortedItems = useMemo(() => sortFeedbacks(items), [items]);
  async function refreshFeedbacks() {
    setItems(await fetchFeedbacks());
  }

  async function runLoadingTask(task: () => Promise<void>, errorKey: string) {
    setError("");
    setLoading(true);

    try {
      await task();
    } catch (error) {
      setError(getTaskErrorMessage(error, errorKey));
    } finally {
      setLoading(false);
    }
  }

  async function runMutationTask(
    task: () => Promise<void>,
    errorKey: string,
    itemId = "",
  ) {
    setError("");
    setSaving(true);
    setBusyItemId(itemId);

    try {
      await task();
    } catch (error) {
      setError(getTaskErrorMessage(error, errorKey));
    } finally {
      setSaving(false);
      setBusyItemId("");
    }
  }

  function getTaskErrorMessage(error: unknown, errorKey: string) {
    return toastErrorMessage(t, error, `admin.feedbacks.${errorKey}`);
  }

  function openCreate() {
    setDialogItem(cloneFeedback());
    setDialogMode("create");
  }

  function openEdit(item: Feedback) {
    setDialogItem(cloneFeedback(item));
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogItem(null);
    setDialogMode(null);
  }

  async function save(item: Feedback) {
    validateUniqueFeedback(item);

    const id = getFeedbackId(item);
    await runMutationTask(async () => saveFeedback(item), "errorSave", id);
  }

  function validateUniqueFeedback(item: Feedback) {
    if (!isDuplicateFeedback(items, item)) return;
    throw new Error(toastText(t, "admin.feedbacks.errorDuplicate"));
  }

  async function saveFeedback(item: Feedback) {
    const id = getFeedbackId(item);
    if (id) await updateFeedback(id, item);
    else await createFeedback(item);
    await refreshFeedbacks();
    closeDialog();
  }

  async function remove(item: Feedback) {
    const id = getFeedbackId(item);
    if (!id) return;
    await runMutationTask(async () => removeFeedback(id), "errorDelete", id);
  }

  async function removeFeedback(id: string) {
    await deleteFeedback(id);
    await refreshFeedbacks();
  }

  async function removeMany(items: Feedback[]) {
    await runMutationTask(
      async () => removeSelectedFeedbacks(items),
      "errorDelete",
    );
  }

  async function removeSelectedFeedbacks(items: Feedback[]) {
    await Promise.all(items.map(removeFeedbackByItem));
    await refreshFeedbacks();
  }

  async function removeFeedbackByItem(item: Feedback) {
    const id = getFeedbackId(item);
    if (!id) return;
    await deleteFeedback(id);
  }

  async function toggleActive(item: Feedback) {
    const id = getFeedbackId(item);
    if (!id) return;
    await runMutationTask(async () => toggleFeedback(item), "errorSave", id);
  }

  async function toggleFeedback(item: Feedback) {
    const id = getFeedbackId(item);
    await updateFeedback(id, { ...item, isActive: !item.isActive });
    await refreshFeedbacks();
  }

  async function deactivateMany(items: Feedback[]) {
    await runMutationTask(
      async () => deactivateSelectedFeedbacks(items),
      "errorSave",
    );
  }

  async function deactivateSelectedFeedbacks(items: Feedback[]) {
    await Promise.all(items.map(deactivateFeedbackByItem));
    await refreshFeedbacks();
  }

  async function deactivateFeedbackByItem(item: Feedback) {
    const id = getFeedbackId(item);
    if (!id) return;
    await updateFeedback(id, { ...item, isActive: false });
  }

  async function uploadImage(file: File) {
    return uploadFeedbackImage(file);
  }

  useEffect(() => {
    runLoadingTask(refreshFeedbacks, "errorLoad");
  }, []);

  return {
    loading,
    saving,
    busyItemId,
    error,
    dialogMode,
    dialogItem,
    sortedItems,
    openCreate,
    openEdit,
    closeDialog,
    save,
    remove,
    removeMany,
    toggleActive,
    deactivateMany,
    uploadImage,
  };
}
