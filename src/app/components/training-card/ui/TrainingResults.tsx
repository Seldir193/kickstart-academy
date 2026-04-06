// // //src\app\components\training-card\ui\TrainingResults.tsx
"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import BulkActionsBar from "./BulkActionsBar";
import { useSelection } from "@/app/admin/(app)/news/hooks/useSelection";
import type { Offer } from "../types";

import { formatTrainingDate } from "../utils";

type Props = {
  loading: boolean;
  items: Offer[];
  selectedIds: string[];
  selectMode: boolean;
  onToggleSelectMode: () => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onOpen: (item: Offer) => void;
  onToggleOne: (id: string) => void;
  avatarSrc: (item: Offer) => string;
};

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

function idOf(item: Offer) {
  return safeText(item?._id);
}

function titleParts(raw: string) {
  const parts = safeText(raw).split(" — ");
  return { left: safeText(parts[0]), right: safeText(parts[1]) };
}

function courseTitle(item: Offer, fallback: string) {
  const raw = safeText(item.title);
  if (!raw) return safeText(item.type) || fallback;
  const { left } = titleParts(raw);
  const dot = safeText(left.split(" • ")[0]);
  return dot || safeText(item.type) || fallback;
}

function courseMeta(item: Offer) {
  const titleLower = safeText(item.title).toLowerCase();
  const course = safeText(item.sub_type || item.type);
  if (!course) return "\u00A0";
  if (titleLower.includes(course.toLowerCase())) return "\u00A0";
  return course;
}

function placeLabel(item: Offer) {
  const city = safeText((item as any).city);
  if (city) return city;
  const loc = safeText((item as any).location);
  if (loc) return loc;
  const { right } = titleParts(safeText(item.title));
  return right || "—";
}

function formatPrice(value?: number) {
  if (typeof value !== "number") return "—";
  return `${value} €`;
}

function pickDate(item: Offer) {
  return (
    safeText((item as any).updatedAt) || safeText((item as any).createdAt) || ""
  );
}

export default function TrainingResults(props: Props) {
  const idsOnPage = useMemo(
    () => props.items.map(idOf).filter(Boolean),
    [props.items],
  );
  const sel = useSelection(idsOnPage);
  const { t, i18n } = useTranslation();

  const trainingFallback = t("common.training.results.fallback.training");
  const loadingLabel = t("common.training.results.loading");
  const emptyLabel = t("common.training.results.empty");
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevCountRef = useRef(0);

  const count = sel.selected.size;
  const showClear = props.selectMode && count >= 2;

  useEffect(() => {
    if (!props.selectMode) {
      if (sel.selected.size) sel.clear();
      prevCountRef.current = 0;
      return;
    }

    const targetIds = props.selectedIds.filter((id) => idsOnPage.includes(id));
    const currentIds = Array.from(sel.selected);
    const sameLen = currentIds.length === targetIds.length;
    const same = sameLen && currentIds.every((id) => targetIds.includes(id));

    if (same) return;
    sel.clear();
    targetIds.forEach((id) => sel.toggleOne(id));
  }, [props.selectMode, props.selectedIds, idsOnPage, sel]);

  useEffect(() => {
    if (!props.selectMode) {
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
  }, [props.selectMode, count]);

  function syncExternalSelection(nextIds: string[]) {
    const current = new Set(props.selectedIds);
    const next = new Set(nextIds);
    const merged = Array.from(
      new Set([...props.selectedIds, ...nextIds, ...idsOnPage]),
    );

    for (const id of merged) {
      const a = current.has(id);
      const b = next.has(id);
      if (a === b) continue;
      props.onToggleOne(id);
    }
  }

  async function deleteSelected() {
    const ids = Array.from(sel.selected);
    if (!ids.length) return;
    await props.onDeleteMany(ids);
    sel.clear();
    syncExternalSelection([]);
    props.onToggleSelectMode();
  }

  function toggleAll() {
    if (sel.isAllSelected) {
      sel.removeAll();
      syncExternalSelection([]);
      return;
    }
    sel.selectAll();
    syncExternalSelection(idsOnPage);
  }

  function clearSelection() {
    sel.clear();
    syncExternalSelection([]);
    requestAnimationFrame(() => cancelBtnRef.current?.focus());
  }

  function onToggleSelectMode() {
    if (props.selectMode) syncExternalSelection([]);
    sel.clear();
    props.onToggleSelectMode();
  }

  function handleRowClick(item: Offer) {
    const id = idOf(item);
    if (!id) return;

    if (!props.selectMode) {
      props.onOpen(item);
      return;
    }

    sel.toggleOne(id);
    props.onToggleOne(id);
  }

  function onEditClick(item: Offer) {
    props.onOpen(item);
  }

  if (!props.items.length) {
    return (
      <section className="card">
        <div className="card__empty">
          {props.loading ? loadingLabel : emptyLabel}
        </div>
      </section>
    );
  }

  return (
    <div className="news-table">
      <div className="news-admin__top-actions">
        <BulkActionsBar
          toggleRef={toggleBtnRef as RefObject<HTMLButtonElement | null>}
          cancelRef={cancelBtnRef as RefObject<HTMLButtonElement | null>}
          clearRef={clearBtnRef as RefObject<HTMLButtonElement | null>}
          selectMode={props.selectMode}
          onToggleSelectMode={onToggleSelectMode}
          selectedCount={count}
          allSelected={sel.isAllSelected}
          busy={false}
          isEmpty={props.items.length === 0}
          onToggleAll={toggleAll}
          onClear={clearSelection}
          onBulkDelete={deleteSelected}
        />
      </div>

      <div className="news-table__scroll">
        <section className="card news-list">
          <div className="news-list__table">
            <div className="news-list__head" aria-hidden="true">
              <div className="news-list__h">
                {t("common.training.results.head.coach")}
              </div>
              <div className="news-list__h">
                {t("common.training.results.head.course")}
              </div>
              <div className="news-list__h">
                {t("common.training.results.head.place")}
              </div>
              <div className="news-list__h">
                {t("common.training.results.head.price")}
              </div>
              <div className="news-list__h">
                {t("common.training.results.head.date")}
              </div>
              <div className="news-list__h news-list__h--right">
                {t("common.training.results.head.action")}
              </div>
            </div>

            <ul className="list list--bleed">
              {props.items.map((item) => {
                const id = idOf(item);
                const checked = sel.selected.has(id);
                const hideEdit = props.selectMode || checked;

                return (
                  <li
                    key={id}
                    className={`list__item chip news-list__row is-fullhover is-interactive ${
                      checked ? "is-selected" : ""
                    } ${props.selectMode ? "is-selectmode" : ""}`}
                    onClick={() => handleRowClick(item)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      handleRowClick(item);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={props.selectMode ? checked : undefined}
                    aria-label={
                      props.selectMode
                        ? t("common.training.results.aria.select", {
                            title: courseTitle(item, trainingFallback),
                          })
                        : t("common.training.results.aria.open", {
                            title: courseTitle(item, trainingFallback),
                          })
                    }
                  >
                    <div className="news-list__cell">
                      <img
                        src={props.avatarSrc(item) || "/assets/img/avatar.png"}
                        alt={
                          safeText(item.coachName)
                            ? t("common.training.results.avatar.named", {
                                name: safeText(item.coachName),
                              })
                            : t("common.training.results.avatar.default")
                        }
                        className="list__avatar"
                        onError={(event) => {
                          event.currentTarget.src = "/assets/img/avatar.png";
                        }}
                      />
                    </div>

                    <div className="news-list__cell">
                      <div className="news-list__title">
                        {courseTitle(item, trainingFallback)}
                      </div>
                      <div className="news-list__excerpt">
                        {courseMeta(item)}
                      </div>
                    </div>

                    <div className="news-list__cell">
                      <div className="news-list__title">{placeLabel(item)}</div>
                      <div className="news-list__excerpt is-empty">
                        {"\u00A0"}
                      </div>
                    </div>

                    <div className="news-list__cell">
                      <div className="news-list__title">
                        {formatPrice(item.price)}
                      </div>
                      <div className="news-list__excerpt is-empty">
                        {"\u00A0"}
                      </div>
                    </div>

                    <div className="news-list__cell">
                      <div className="news-list__title">
                        {formatTrainingDate(pickDate(item), i18n.language)}
                      </div>
                      <div className="news-list__excerpt is-empty">
                        {"\u00A0"}
                      </div>
                    </div>

                    {!hideEdit ? (
                      <div
                        className="news-list__cell news-list__cell--action"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditClick(item);
                        }}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          aria-label={t("common.training.results.action.edit")}
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
