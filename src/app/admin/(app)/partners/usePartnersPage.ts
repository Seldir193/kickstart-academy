import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import type { Partner } from "./types";
import {
  createPartner,
  deletePartner,
  fetchPartners,
  updatePartner,
  uploadPartnerLogo,
} from "./api";
import {
  clonePartner,
  getPartnerId,
  isDuplicatePartner,
  sortPartners,
} from "./helpers";

export type PartnerDialogMode = "create" | "edit";

export function usePartnersPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyItemId, setBusyItemId] = useState("");
  const [error, setError] = useState("");
  const [dialogMode, setDialogMode] = useState<PartnerDialogMode | null>(null);
  const [dialogItem, setDialogItem] = useState<Partner | null>(null);

  const sortedItems = useMemo(() => sortPartners(items), [items]);

  async function refreshPartners() {
    setItems(await fetchPartners());
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
    return toastErrorMessage(t, error, `admin.partners.${errorKey}`);
  }

  function openCreate() {
    setDialogItem(clonePartner());
    setDialogMode("create");
  }

  function openEdit(item: Partner) {
    setDialogItem(clonePartner(item));
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogItem(null);
    setDialogMode(null);
  }

  async function save(item: Partner) {
    validateUniquePartner(item);
    const id = getPartnerId(item);
    await runMutationTask(async () => savePartner(item), "errorSave", id);
  }

  function validateUniquePartner(item: Partner) {
    if (!isDuplicatePartner(items, item)) return;
    throw new Error(toastText(t, "admin.partners.errorDuplicate"));
  }

  async function savePartner(item: Partner) {
    const id = getPartnerId(item);
    if (id) await updatePartner(id, item);
    else await createPartner(item);
    await refreshPartners();
    closeDialog();
  }

  async function remove(item: Partner) {
    const id = getPartnerId(item);
    if (!id) return;
    await runMutationTask(async () => removePartner(id), "errorDelete", id);
  }

  async function removePartner(id: string) {
    await deletePartner(id);
    await refreshPartners();
  }

  async function toggleActive(item: Partner) {
    const id = getPartnerId(item);
    if (!id) return;
    await runMutationTask(async () => togglePartner(item), "errorSave", id);
  }

  async function togglePartner(item: Partner) {
    const id = getPartnerId(item);
    await updatePartner(id, { ...item, isActive: !item.isActive });
    await refreshPartners();
  }

  async function uploadLogo(file: File) {
    return uploadPartnerLogo(file);
  }

  useEffect(() => {
    runLoadingTask(refreshPartners, "errorLoad");
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
    toggleActive,
    uploadLogo,
  };
}
