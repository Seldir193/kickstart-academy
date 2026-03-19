//src\app\admin\(app)\coaches\components\CoachesFilters.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SortKey } from "../types";

type Props = {
  q: string;
  onChangeQ: (v: string) => void;
  sort: SortKey;
  onChangeSort: (v: SortKey) => void;
};

export default function CoachesFilters({
  q,
  onChangeQ,
  sort,
  onChangeSort,
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  const sortLabel = useMemo(() => {
    if (sort === "newest") return "Neueste zuerst";
    if (sort === "oldest") return "Älteste zuerst";
    if (sort === "name_asc") return "Name A–Z";
    return "Name Z–A";
  }, [sort]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(ev: PointerEvent) {
      const target = ev.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div
      className="coach-filters__row"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        marginBottom: 16,
      }}
    >
      <div className="coach-filters__search" style={{ flex: 1, minWidth: 320 }}>
        <label className="lbl coach-filters__label">Suche</label>

        <div className="input-with-icon">
          <img
            src="/icons/search.svg"
            alt=""
            aria-hidden="true"
            className="input-with-icon__icon"
          />
          <input
            className="input input-with-icon__input"
            placeholder="Name, slug, position…"
            value={q}
            onChange={(e) => onChangeQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onChangeQ("");
            }}
          />
        </div>
      </div>

      <div className="coach-filters__sort" style={{ width: 260 }}>
        <label className="block text-sm text-gray-600">Sortieren nach</label>

        <div
          className={
            "ks-training-select" + (open ? " ks-training-select--open" : "")
          }
        >
          <button
            type="button"
            ref={triggerRef}
            className="ks-training-select__trigger"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="ks-training-select__label">{sortLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {open ? (
            <ul
              ref={menuRef}
              className="ks-training-select__menu"
              role="listbox"
              aria-label="Sort"
            >
              <li>
                <button
                  type="button"
                  className={
                    "ks-training-select__option" +
                    (sort === "newest" ? " is-selected" : "")
                  }
                  onClick={() => {
                    onChangeSort("newest");
                    setOpen(false);
                  }}
                >
                  Neueste zuerst
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={
                    "ks-training-select__option" +
                    (sort === "oldest" ? " is-selected" : "")
                  }
                  onClick={() => {
                    onChangeSort("oldest");
                    setOpen(false);
                  }}
                >
                  Älteste zuerst
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={
                    "ks-training-select__option" +
                    (sort === "name_asc" ? " is-selected" : "")
                  }
                  onClick={() => {
                    onChangeSort("name_asc");
                    setOpen(false);
                  }}
                >
                  Name A–Z
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={
                    "ks-training-select__option" +
                    (sort === "name_desc" ? " is-selected" : "")
                  }
                  onClick={() => {
                    onChangeSort("name_desc");
                    setOpen(false);
                  }}
                >
                  Name Z–A
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
