"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { SortKey } from "../types";

type Props = {
  q: string;
  onChangeQ: (v: string) => void;
  sort: SortKey;
  onChangeSort: (v: SortKey) => void;
  actionSlot?: ReactNode;
};

export default function NewsFilters({
  q,
  onChangeQ,
  sort,
  onChangeSort,
  actionSlot,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  const sortLabel = useMemo(() => {
    if (sort === "newest") return t("common.admin.news.filters.newestFirst");
    if (sort === "oldest") return t("common.admin.news.filters.oldestFirst");
    if (sort === "title_asc") return t("common.admin.news.filters.titleAsc");
    return t("common.admin.news.filters.titleDesc");
  }, [sort, t]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t))
        return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="coach-filters__row news-filters__row">
      <div className="coach-filters__search news-filters__search">
        <div className="input-with-icon">
          <img
            src="/icons/search.svg"
            alt=""
            aria-hidden="true"
            className="input-with-icon__icon"
          />
          <input
            className="input input-with-icon__input"
            placeholder={t("common.admin.news.filters.searchPlaceholder")}
            aria-label={t("common.admin.news.filters.searchAria")}
            value={q}
            onChange={(e) => onChangeQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onChangeQ("");
            }}
          />
        </div>
      </div>

      <div className="coach-filters__sort news-filters__sort">
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
              aria-label={t("common.admin.news.filters.sort")}
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
                  {t("common.admin.news.filters.newestFirst")}
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
                  {t("common.admin.news.filters.oldestFirst")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={
                    "ks-training-select__option" +
                    (sort === "title_asc" ? " is-selected" : "")
                  }
                  onClick={() => {
                    onChangeSort("title_asc");
                    setOpen(false);
                  }}
                >
                  {t("common.admin.news.filters.titleAsc")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={
                    "ks-training-select__option" +
                    (sort === "title_desc" ? " is-selected" : "")
                  }
                  onClick={() => {
                    onChangeSort("title_desc");
                    setOpen(false);
                  }}
                >
                  {t("common.admin.news.filters.titleDesc")}
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      </div>

      {actionSlot ? (
        <div className="news-filters__action">{actionSlot}</div>
      ) : null}
    </div>
  );
}
