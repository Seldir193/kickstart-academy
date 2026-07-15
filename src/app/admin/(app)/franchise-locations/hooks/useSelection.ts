"use client";

import { useEffect, useMemo, useState } from "react";

function to_set(ids: string[]) {
  return new Set(ids.map(String).filter(Boolean));
}

function intersection(a: Set<string>, b: Set<string>) {
  const out = new Set<string>();
  for (const id of a) if (b.has(id)) out.add(id);
  return out;
}

export function useSelection(idsOnPage: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const all = useMemo(() => to_set(idsOnPage), [idsOnPage]);

  useEffect(() => {
    setSelected((prev) => intersection(prev, all));
  }, [all]);

  const selectedCount = useMemo(() => selected.size, [selected]);

  const isAllSelected = useMemo(() => {
    if (!all.size) return false;
    if (!selected.size) return false;
    for (const id of all) if (!selected.has(id)) return false;
    return true;
  }, [all, selected]);

  function toggleOne(id: string) {
    const key = String(id || "");
    if (!key) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
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

  return {
    selected,
    selectedCount,
    isAllSelected,
    toggleOne,
    selectAll,
    removeAll,
    clear,
  };
}
