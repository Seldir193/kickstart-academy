import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Feedback } from "./types";
import {
  createFeedback,
  deleteFeedback,
  fetchFeedbacks,
  updateFeedback,
  uploadFeedbackImage,
} from "./api";
import { cloneFeedback, getFeedbackId, sortFeedbacks } from "./helpers";

export type FeedbackDialogMode = "create" | "edit";

export function useFeedbacksPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Feedback[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dialogMode, setDialogMode] = useState<FeedbackDialogMode | null>(null);
  const [dialogItem, setDialogItem] = useState<Feedback | null>(null);

  const sortedItems = useMemo(() => sortFeedbacks(items), [items]);

  async function load() {
    await runTask(async () => setItems(await fetchFeedbacks()), "errorLoad");
  }

  async function runTask(task: () => Promise<void>, key: string) {
    setError("");
    setBusy(true);
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(`admin.feedbacks.${key}`));
    } finally {
      setBusy(false);
    }
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
    await runTask(async () => saveFeedback(item), "errorSave");
  }

  async function saveFeedback(item: Feedback) {
    const id = getFeedbackId(item);
    if (id) await updateFeedback(id, item);
    else await createFeedback(item);
    await load();
    closeDialog();
  }

  async function remove(item: Feedback) {
    const id = getFeedbackId(item);
    if (!id || !window.confirm(t("admin.feedbacks.confirmDeleteText"))) return;
    await runTask(async () => removeFeedback(id), "errorDelete");
  }

  async function removeFeedback(id: string) {
    await deleteFeedback(id);
    await load();
  }

  async function toggleActive(item: Feedback) {
    if (!getFeedbackId(item)) return;
    await save({ ...item, isActive: !item.isActive });
  }

  async function uploadImage(file: File) {
    return uploadFeedbackImage(file);
  }

  useEffect(() => {
    load();
  }, []);

  return {
    busy,
    error,
    dialogMode,
    dialogItem,
    sortedItems,
    openCreate,
    openEdit,
    closeDialog,
    save,
    remove,
    toggleActive,
    uploadImage,
  };
}