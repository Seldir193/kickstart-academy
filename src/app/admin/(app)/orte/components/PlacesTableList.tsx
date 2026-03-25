"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import type { Place } from "@/types/place";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import { displayPlaceId, safeText } from "@/app/admin/(app)/orte/utils";

type Props = {
  items: Array<Place & { publicId?: number }>;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  busy: boolean;
  onOpen: (p: Place) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

function idOf(p: any) {
  return String(p?._id || "").trim();
}

export default function PlacesTableList({
  items,
  selectMode,
  onToggleSelectMode,
  busy,
  onOpen,
  onDeleteMany,
  toggleBtnRef,
}: Props) {
  const idsOnPage = useMemo(
    () => items.map((p) => idOf(p)).filter(Boolean),
    [items],
  );
  const sel = useSelection(idsOnPage);

  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);

  const count = sel.selected.size;
  const showClear = selectMode && count >= 2;

  useEffect(() => {
    if (!selectMode) {
      prevCountRef.current = 0;
      return;
    }

    const prev = prevCountRef.current;
    prevCountRef.current = count;

    if (count >= 2) {
      requestAnimationFrame(() => clearBtnRef.current?.focus());
      return;
    }

    if (prev >= 2 && count < 2) {
      requestAnimationFrame(() => cancelBtnRef.current?.focus());
    }
  }, [selectMode, count]);

  async function deleteSelected() {
    const ids = Array.from(sel.selected);
    if (!ids.length) return;
    await onDeleteMany(ids);
    sel.clear();
    onToggleSelectMode();
  }

  function onToggleAll() {
    sel.isAllSelected ? sel.removeAll() : sel.selectAll();
  }

  function onClearSelection() {
    sel.clear();
    requestAnimationFrame(() => cancelBtnRef.current?.focus());
  }

  function rowClick(p: Place & { publicId?: number }) {
    const id = idOf(p);
    if (!id) return;
    if (selectMode) sel.toggleOne(id);
    else onOpen(p);
  }

  if (!items.length) {
    return (
      <section className="card">
        <div className="card__empty">{busy ? "Loading..." : "No entries."}</div>
      </section>
    );
  }

  return (
    <div className="news-table">
      <div className="news-admin__top-actions">
        <BulkActions
          toggleRef={toggleBtnRef as RefObject<HTMLButtonElement | null>}
          cancelRef={cancelBtnRef}
          clearRef={clearBtnRef}
          selectMode={selectMode}
          onToggleSelectMode={() => {
            sel.clear();
            onToggleSelectMode();
          }}
          count={count}
          isAllSelected={sel.isAllSelected}
          busy={busy}
          isEmpty={items.length === 0}
          onToggleAll={onToggleAll}
          onClear={onClearSelection}
          showClear={showClear}
          onDelete={deleteSelected}
          toggleLabel="Select locations"
          selectedLabel="selected"
          selectAllLabel="Select all"
          clearAllLabel="Clear all"
          deleteLabel="Delete"
          cancelLabel="Cancel"
        />
      </div>

      <div className="news-table__scroll">
        <section className="card news-list">
          <div className="news-list__table">
            <div className="news-list__head" aria-hidden="true">
              <div className="news-list__h">ID</div>
              <div className="news-list__h">Name</div>
              <div className="news-list__h">Address</div>
              <div className="news-list__h">ZIP</div>
              <div className="news-list__h">City</div>
              <div className="news-list__h news-list__h--right">Action</div>
            </div>

            <ul className="list list--bleed">
              {items.map((p) => {
                const id = idOf(p);
                const checked = sel.selected.has(id);
                const hideEdit = selectMode || checked;

                return (
                  <li
                    key={id}
                    className={`list__item chip news-list__row is-fullhover is-interactive ${
                      checked ? "is-selected" : ""
                    } ${selectMode ? "is-selectmode" : ""}`}
                    onClick={() => rowClick(p)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        rowClick(p);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectMode ? checked : undefined}
                    aria-label={
                      selectMode
                        ? `Select: ${safeText(p.name)}`
                        : `Open: ${safeText(p.name)}`
                    }
                  >
                    <div className="news-list__cell places-mono">
                      {displayPlaceId(p as any)}
                    </div>

                    <div className="news-list__cell">
                      <div className="news-list__title">
                        {safeText(p.name) || "—"}
                      </div>
                      <div className="news-list__excerpt is-empty">—</div>
                    </div>

                    <div className="news-list__cell news-list__cell--addr">
                      {safeText((p as any).address) || "—"}
                    </div>

                    <div className="news-list__cell places-mono">
                      {safeText((p as any).zip) || "—"}
                    </div>

                    <div className="news-list__cell news-list__cell--city">
                      {safeText((p as any).city) || "—"}
                    </div>

                    {!hideEdit ? (
                      <div
                        className="news-list__cell news-list__cell--action"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(p);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          aria-label="Edit"
                        >
                          <img
                            src="/icons/edit.svg"
                            alt=""
                            aria-hidden="true"
                            className="icon-img"
                          />
                        </span>
                      </div>
                    ) : (
                      <div
                        className="news-list__cell news-list__cell--action news-list__actions--hidden"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
