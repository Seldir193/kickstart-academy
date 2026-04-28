"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Feedback } from "../types";
import FeedbackCard from "./FeedbackCard";
import FeedbackPagination from "./FeedbackPagination";
import FeedbackBulkActions from "./FeedbackBulkActions";
import { getFeedbackId } from "../helpers";

type Props = {
  items: Feedback[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  busyItemId: string;
  onPrev: () => void;
  onNext: () => void;
  onEdit: (item: Feedback) => void;
  onDelete: (item: Feedback) => void;
  onToggle: (item: Feedback) => void;
  onBulkDelete: (items: Feedback[]) => Promise<void>;
  onBulkDeactivate: (items: Feedback[]) => Promise<void>;
};

export default function FeedbackList(props: Props) {
  const { t } = useTranslation();
  const selection = useFeedbackSelection(props.items);
  const hasItems = props.items.length > 0;

  if (props.loading && !hasItems) {
    return <div className="card">{t("admin.feedbacks.loading")}</div>;
  }

  if (!props.loading && !hasItems) {
    return <div className="card">{t("admin.feedbacks.empty")}</div>;
  }

  return (
    <section className="news-admin__section">
      <FeedbackCounter total={props.total} />
      <FeedbackTable props={props} selection={selection} />
      <FeedbackPagination
        page={props.page}
        totalPages={props.totalPages}
        onPrev={props.onPrev}
        onNext={props.onNext}
      />
    </section>
  );
}

function FeedbackCounter({ total }: { total: number }) {
  return (
    <div className="news-admin__section-head-number">
      <span className="news-admin__section-meta">
        {total ? `(${total})` : ""}
      </span>
    </div>
  );
}

function FeedbackTable({ props, selection }: TableProps) {
  return (
    <div className="news-admin__box news-admin__box--scroll3">
      <div className="news-table">
        <div className="news-admin__top-actions">
          <FeedbackBulkToolbar props={props} selection={selection} />
        </div>

        <div className="news-table__scroll">
          <section className="card news-list">
            <div className="news-list__table">
              <FeedbackTableHead />
              <FeedbackRows props={props} selection={selection} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FeedbackBulkToolbar({ props, selection }: BulkToolbarProps) {
  return (
    <FeedbackBulkActions
      toggleRef={selection.toggleRef}
      cancelRef={selection.cancelRef}
      clearRef={selection.clearRef}
      selectMode={selection.selectMode}
      count={selection.selectedIds.size}
      isAllSelected={selection.isAllSelected}
      disabled={props.loading}
      showClear={selection.selectedIds.size >= 2}
      onToggleSelectMode={selection.toggleSelectMode}
      onToggleAll={selection.toggleAll}
      onClear={selection.clearSelection}
      onDeactivate={() => runBulkDeactivate(props, selection)}
      onDelete={() => runBulkDelete(props, selection)}
    />
  );
}

function FeedbackRows({ props, selection }: TableProps) {
  return (
    <ul className="list list--bleed feedback-admin__list">
      {props.items.map((item) => {
        const id = getFeedbackId(item);

        return (
          <FeedbackCard
            key={id}
            item={item}
            busyItemId={props.busyItemId}
            selectMode={selection.selectMode}
            selected={selection.selectedIds.has(id)}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
            onToggle={props.onToggle}
            onSelect={selection.toggleOne}
          />
        );
      })}
    </ul>
  );
}

function FeedbackTableHead() {
  const { t } = useTranslation();

  return (
    <div className="news-list__head feedback-admin__head-row" aria-hidden="true">
      <div className="news-list__h">{t("admin.feedbacks.table.image")}</div>
      <div className="news-list__h">{t("admin.feedbacks.table.author")}</div>
      <div className="news-list__h">{t("admin.feedbacks.table.category")}</div>
      <div className="news-list__h">{t("admin.feedbacks.table.order")}</div>
      <div className="news-list__h">{t("admin.feedbacks.table.status")}</div>
      <div className="news-list__h">{t("admin.feedbacks.table.updated")}</div>
      <div className="news-list__h news-list__h--right">
        {t("admin.feedbacks.table.actions")}
      </div>
    </div>
  );
}

function useFeedbackSelection(items: Feedback[]) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const clearRef = useRef<HTMLButtonElement | null>(null);
  const ids = useMemo(() => items.map(getFeedbackId).filter(Boolean), [items]);
  const isAllSelected = ids.length > 0 && ids.every(isSelected);

  function isSelected(id: string) {
    return selectedIds.has(id);
  }

  function toggleSelectMode() {
    setSelectedIds(new Set());
    setSelectMode((current) => !current);
  }

  function toggleAll() {
    setSelectedIds(isAllSelected ? new Set() : new Set(ids));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function toggleOne(id: string) {
    setSelectedIds((current) => toggleSelectedId(current, id));
  }

  return {
    ids,
    selectMode,
    selectedIds,
    toggleRef,
    cancelRef,
    clearRef,
    isAllSelected,
    toggleSelectMode,
    toggleAll,
    clearSelection,
    toggleOne,
  };
}

function toggleSelectedId(current: Set<string>, id: string) {
  const next = new Set(current);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
}

async function runBulkDelete(props: Props, selection: SelectionState) {
  const selected = getSelectedItems(props.items, selection.selectedIds);
  if (!selected.length) return;
  await props.onBulkDelete(selected);
  selection.toggleSelectMode();
}

async function runBulkDeactivate(props: Props, selection: SelectionState) {
  const selected = getSelectedItems(props.items, selection.selectedIds);
  if (!selected.length) return;
  await props.onBulkDeactivate(selected);
  selection.toggleSelectMode();
}

function getSelectedItems(items: Feedback[], selectedIds: Set<string>) {
  return items.filter((item) => selectedIds.has(getFeedbackId(item)));
}

type SelectionState = ReturnType<typeof useFeedbackSelection>;

type TableProps = {
  props: Props;
  selection: SelectionState;
};

type BulkToolbarProps = {
  props: Props;
  selection: SelectionState;
};