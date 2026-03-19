// src/app/admin/news/hooks/useSelection.ts
"use client";

import { useMemo, useState } from "react";

function toSet(ids: string[]) {
  return new Set(ids.filter(Boolean));
}

export function useSelection(idsOnPage: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const all = useMemo(() => toSet(idsOnPage), [idsOnPage]);

  const isAllSelected = useMemo(() => {
    if (all.size === 0) return false;
    for (const id of all) if (!selected.has(id)) return false;
    return true;
  }, [all, selected]);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of all) next.add(id);
      return next;
    });
  }

  function removeAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of all) next.delete(id);
      return next;
    });
  }

  function clear() {
    setSelected(new Set());
  }

  return { selected, isAllSelected, toggleOne, selectAll, removeAll, clear };
}
