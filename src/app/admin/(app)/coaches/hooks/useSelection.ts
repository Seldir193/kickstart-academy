// src/app/admin/(app)/coaches/hooks/useSelection.ts
"use client";

import { useMemo, useState } from "react";
import { toSet } from "../utils";

export function useSelection(idsOnPage: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const all = useMemo(() => toSet(idsOnPage), [idsOnPage]);

  const isAllSelected = useMemo(() => {
    if (!all.size) return false;
    if (!selected.size) return false;
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
    setSelected(new Set(all));
  }

  function removeAll() {
    setSelected(new Set());
  }

  function clear() {
    setSelected(new Set());
  }

  return { selected, isAllSelected, toggleOne, selectAll, removeAll, clear };
}
