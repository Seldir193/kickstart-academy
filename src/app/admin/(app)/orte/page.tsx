"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PlaceDialog from "@/app/components/places/PlaceDialog";
import type { Place } from "@/types/place";
import PlacesTableList from "@/app/admin/(app)/orte/components/PlacesTableList";
import { usePlacesList } from "@/app/admin/(app)/orte/hooks/usePlacesList";
import { deletePlacesBulk } from "@/app/admin/(app)/orte/api";
import { useDebouncedValue } from "@/app/admin/(app)/orte/hooks/useDebouncedValue";
import { sortPlaces } from "@/app/admin/(app)/orte/utils";

type SortKey = "newest" | "oldest" | "city_asc" | "city_desc";

function sortLabel(sort: SortKey) {
  if (sort === "newest") return "Newest first";
  if (sort === "oldest") return "Oldest first";
  if (sort === "city_asc") return "City A–Z";
  return "City Z–A";
}

export default function OrtePage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 250);
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sortMenuRef = useRef<HTMLUListElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  const list = usePlacesList({ page, q: qDebounced, sort });
  const sortedItems = useMemo(
    () => sortPlaces(list.items as any, sort),
    [list.items, sort],
  );

  const pageCount = useMemo(() => list.pageCount, [list.pageCount]);
  const [mutating, setMutating] = useState(false);
  const busy = mutating;

  useEffect(() => {
    if (!sortOpen) return;

    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (sortTriggerRef.current?.contains(t)) return;
      if (sortMenuRef.current?.contains(t)) return;
      setSortOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [sortOpen]);

  useEffect(() => {
    setSelectMode(false);
  }, [page, qDebounced, sort]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(p: Place) {
    setEditing(p);
    setDialogOpen(true);
  }

  async function handleDeleteMany(ids: string[]) {
    if (!ids.length) return;
    setMutating(true);
    try {
      await deletePlacesBulk(ids);
      await list.reload();
      setSelectMode(false);
    } finally {
      setMutating(false);
    }
  }

  return (
    <div className="news-admin ks places-admin">
      <main className="container">
        <div className="ks-places-toolbar ks-places-toolbar--compact">
          <div className="ks-places-toolbar__search">
            <div className="input-with-icon">
              <img
                src="/icons/search.svg"
                alt=""
                aria-hidden="true"
                className="input-with-icon__icon"
              />
              <input
                className="input input-with-icon__input"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Name, street, city, zip..."
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQ("");
                    setPage(1);
                  }
                }}
              />
            </div>
          </div>

          <div className="ks-places-toolbar__sort">
            <div
              className={
                "ks-training-select" +
                (sortOpen ? " ks-training-select--open" : "")
              }
            >
              <button
                type="button"
                ref={sortTriggerRef}
                className="ks-training-select__trigger"
                onClick={() => setSortOpen((o) => !o)}
                disabled={busy}
                aria-label="Sort order"
              >
                <span className="ks-training-select__label">
                  {sortLabel(sort)}
                </span>
                <span
                  className="ks-training-select__chevron"
                  aria-hidden="true"
                />
              </button>

              {sortOpen ? (
                <ul
                  ref={sortMenuRef}
                  className="ks-training-select__menu"
                  role="listbox"
                  aria-label="Sort order"
                >
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "newest" ? " is-selected" : "")
                      }
                      onClick={() => {
                        setSort("newest");
                        setSortOpen(false);
                        setPage(1);
                      }}
                    >
                      Newest first
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
                        setSort("oldest");
                        setSortOpen(false);
                        setPage(1);
                      }}
                    >
                      Oldest first
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "city_asc" ? " is-selected" : "")
                      }
                      onClick={() => {
                        setSort("city_asc");
                        setSortOpen(false);
                        setPage(1);
                      }}
                    >
                      City A–Z
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "city_desc" ? " is-selected" : "")
                      }
                      onClick={() => {
                        setSort("city_desc");
                        setSortOpen(false);
                        setPage(1);
                      }}
                    >
                      City Z–A
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>

          <div className="ks-places-toolbar__action">
            <button
              className="btn"
              onClick={openCreate}
              type="button"
              disabled={busy}
            >
              <img
                src="/icons/plus.svg"
                alt=""
                aria-hidden="true"
                className="btn__icon"
              />
              New location
            </button>
          </div>
        </div>

        {list.error ? (
          <div className="card" role="alert">
            <div className="text-red-600">{list.error}</div>
          </div>
        ) : null}

        <section className="news-admin__section">
          <div className="news-admin__section-head-number">
            <span className="news-admin__section-meta">
              {list.total ? `(${list.total})` : ""}
            </span>
          </div>

          <div
            className={
              "news-admin__box news-admin__box--scroll3" +
              (!busy && !list.items.length ? " is-empty" : "")
            }
          >
            <PlacesTableList
              items={sortedItems}
              selectMode={selectMode}
              onToggleSelectMode={() => setSelectMode((p) => !p)}
              busy={busy}
              onOpen={openEdit}
              onDeleteMany={handleDeleteMany}
              toggleBtnRef={toggleBtnRef}
            />
          </div>

          <div className="pager pager--arrows mt-3">
            <button
              type="button"
              className="btn"
              aria-label="Previous page"
              disabled={list.loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <img
                src="/icons/arrow_right_alt.svg"
                alt=""
                aria-hidden="true"
                className="icon-img icon-img--left"
              />
            </button>

            <div className="pager__count" aria-live="polite" aria-atomic="true">
              {page} / {pageCount}
            </div>

            <button
              type="button"
              className="btn"
              aria-label="Next page"
              disabled={list.loading || page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              <img
                src="/icons/arrow_right_alt.svg"
                alt=""
                aria-hidden="true"
                className="icon-img"
              />
            </button>
          </div>
        </section>
      </main>

      <PlaceDialog
        open={dialogOpen}
        initial={editing || undefined}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          setDialogOpen(false);
          list.reload();
        }}
      />
    </div>
  );
}
