"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Place } from "@/types/place";
import { deletePlacesBulk } from "@/app/admin/(app)/orte/api";
import { useDebouncedValue } from "@/app/admin/(app)/orte/hooks/useDebouncedValue";
import { usePlacesList } from "@/app/admin/(app)/orte/hooks/usePlacesList";
import { sortPlaces } from "@/app/admin/(app)/orte/utils";
import type { PlacesSortKey } from "./types";

export function useOrtePageState() {
  const filters = usePlacesFilters();
  const data = useOrtePageData(filters);
  const handleDeleteMany = createDeleteHandler(data);
  return createPageModel(filters, data, handleDeleteMany);
}

function usePlacesFilters() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 250);
  const [sort, setSort] = useState<PlacesSortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sortMenuRef = useRef<HTMLUListElement | null>(null);
  return { page, setPage, q, setQ, qDebounced, sort, setSort, sortOpen, setSortOpen, sortTriggerRef, sortMenuRef };
}

function useOrtePageData(filters: ReturnType<typeof usePlacesFilters>) {
  const dialog = usePlacesDialog();
  const selection = usePlacesSelectionReset(filters.page, filters.qDebounced, filters.sort);
  const list = usePlacesList({ page: filters.page, q: filters.qDebounced, sort: filters.sort });
  const [mutating, setMutating] = useState(false);
  const sortedItems = useMemo(() => sortPlaces(list.items, filters.sort), [list.items, filters.sort]);
  return { dialog, selection, list, mutating, setMutating, sortedItems };
}

function createDeleteHandler(data: ReturnType<typeof useOrtePageData>) {
  return async (ids: string[]) => {
    if (!ids.length) return;
    await mutatePlaces(ids, data.list.reload, data.setMutating, data.selection.close);
  };
}

function createPageModel(
  filters: ReturnType<typeof usePlacesFilters>,
  data: ReturnType<typeof useOrtePageData>,
  handleDeleteMany: (ids: string[]) => Promise<void>,
) {
  return {
    ...pageStateValues(filters),
    ...pageDataValues(data),
    ...pageActions(filters, data, handleDeleteMany),
  };
}

function pageStateValues(filters: ReturnType<typeof usePlacesFilters>) {
  return { page: filters.page, q: filters.q, sort: filters.sort, sortOpen: filters.sortOpen, sortTriggerRef: filters.sortTriggerRef, sortMenuRef: filters.sortMenuRef };
}

function pageDataValues(data: ReturnType<typeof useOrtePageData>) {
  return { list: data.list, sortedItems: data.sortedItems, busy: data.mutating, dialog: data.dialog, selection: data.selection };
}

function pageActions(filters: ReturnType<typeof usePlacesFilters>, data: ReturnType<typeof useOrtePageData>, handleDeleteMany: (ids: string[]) => Promise<void>) {
  return {
    setSortOpen: filters.setSortOpen,
    changeQuery: (value: string) => updateQuery(value, filters.setQ, filters.setPage),
    clearQuery: () => updateQuery("", filters.setQ, filters.setPage),
    changeSort: (next: PlacesSortKey) => changeSort(next, filters.setSort, filters.setSortOpen, filters.setPage),
    previousPage: () => filters.setPage((current) => Math.max(1, current - 1)),
    nextPage: () => filters.setPage((current) => Math.min(data.list.pageCount, current + 1)),
    handleDeleteMany,
  };
}

function usePlacesDialog() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);

  return {
    open,
    editing,
    close: () => setOpen(false),
    create: () => openPlaceDialog(null, setEditing, setOpen),
    edit: (place: Place) => openPlaceDialog(place, setEditing, setOpen),
  };
}

function usePlacesSelectionReset(page: number, q: string, sort: PlacesSortKey) {
  const [selectMode, setSelectMode] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => setSelectMode(false), [page, q, sort]);

  return {
    selectMode,
    toggleBtnRef,
    close: () => setSelectMode(false),
    toggle: () => setSelectMode((current) => !current),
  };
}

function openPlaceDialog(
  place: Place | null,
  setEditing: (place: Place | null) => void,
  setOpen: (open: boolean) => void,
) {
  setEditing(place);
  setOpen(true);
}

function updateQuery(value: string, setQ: (value: string) => void, setPage: (page: number) => void) {
  setQ(value);
  setPage(1);
}

function changeSort(
  sort: PlacesSortKey,
  setSort: (sort: PlacesSortKey) => void,
  setOpen: (open: boolean) => void,
  setPage: (page: number) => void,
) {
  setSort(sort);
  setOpen(false);
  setPage(1);
}

async function mutatePlaces(
  ids: string[],
  reload: () => Promise<void>,
  setMutating: (mutating: boolean) => void,
  closeSelection: () => void,
) {
  setMutating(true);
  try {
    await deletePlacesBulk(ids);
    await reload();
    closeSelection();
  } finally {
    setMutating(false);
  }
}
