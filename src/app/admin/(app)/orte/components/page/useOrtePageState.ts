"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Place } from "@/types/place";
import { deletePlacesBulk } from "@/app/admin/(app)/orte/api";
import { useDebouncedValue } from "@/app/admin/(app)/orte/hooks/useDebouncedValue";
import { usePlacesList } from "@/app/admin/(app)/orte/hooks/usePlacesList";
import { sortPlaces } from "@/app/admin/(app)/orte/utils";
import type { PlacesSortKey } from "./types";

export function useOrtePageState() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 250);
  const [sort, setSort] = useState<PlacesSortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sortMenuRef = useRef<HTMLUListElement | null>(null);
  const dialog = usePlacesDialog();
  const selection = usePlacesSelectionReset(page, qDebounced, sort);
  const list = usePlacesList({ page, q: qDebounced, sort });
  const [mutating, setMutating] = useState(false);
  const sortedItems = useMemo(() => sortPlaces(list.items, sort), [list.items, sort]);

  async function handleDeleteMany(ids: string[]) {
    if (!ids.length) return;
    await mutatePlaces(ids, list.reload, setMutating, selection.close);
  }

  return {
    page,
    q,
    sort,
    sortOpen,
    sortTriggerRef,
    sortMenuRef,
    list,
    sortedItems,
    busy: mutating,
    dialog,
    selection,
    setSortOpen,
    changeQuery: (value: string) => updateQuery(value, setQ, setPage),
    clearQuery: () => updateQuery("", setQ, setPage),
    changeSort: (next: PlacesSortKey) => changeSort(next, setSort, setSortOpen, setPage),
    previousPage: () => setPage((current) => Math.max(1, current - 1)),
    nextPage: () => setPage((current) => Math.min(list.pageCount, current + 1)),
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
