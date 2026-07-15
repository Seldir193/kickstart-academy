import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { News } from "../../types";
import { getId } from "../helpers";
import type { NewsAdminViewModel } from "./types";

export function useNewsDeleteDialog(p: NewsAdminViewModel) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<News | null>(null);
  const fallback = t("common.admin.news.page.thisPost");
  const closeDelete = () => closeDeleteState(setOpen, setTarget);
  const openDelete = (item: News) => openDeleteState(item, setOpen, setTarget);
  const confirmDelete = () =>
    confirmDeleteState(target, p.onDeleteById, closeDelete);
  const deleteName = (item: News | null) => getDeleteName(item, fallback);
  return { open, target, openDelete, closeDelete, confirmDelete, deleteName };
}

function openDeleteState(item: News, setOpen: SetOpen, setTarget: SetTarget) {
  setTarget(item);
  setOpen(true);
}

function closeDeleteState(setOpen: SetOpen, setTarget: SetTarget) {
  setOpen(false);
  setTarget(null);
}

async function confirmDeleteState(
  target: News | null,
  onDelete: OnDelete,
  close: () => void,
) {
  const id = target ? getId(target) : "";
  if (!id) return;
  await onDelete(id);
  close();
}

function getDeleteName(item: News | null, fallback: string) {
  return String(item?.title || item?.slug || fallback).trim();
}

type SetOpen = (value: boolean) => void;
type SetTarget = (value: News | null) => void;
type OnDelete = (id: string) => Promise<void>;
