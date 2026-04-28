"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Partner } from "../types";
import PartnerCard from "./PartnerCard";
import PartnerPagination from "./PartnerPagination";
import PartnerBulkActions from "./PartnerBulkActions";
import { getPartnerId } from "../helpers";

type Props = {
  items: Partner[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  busyItemId: string;
  onPrev: () => void;
  onNext: () => void;
  onEdit: (item: Partner) => void;
  onDelete: (item: Partner) => void;
  onToggle: (item: Partner) => void;
  onBulkDelete: (items: Partner[]) => Promise<void>;
  onBulkDeactivate: (items: Partner[]) => Promise<void>;
};

export default function PartnerList(props: Props) {
  const { t } = useTranslation();
  const selection = usePartnerSelection(props.items);
  const hasItems = props.items.length > 0;

  if (props.loading && !hasItems) {
    return <div className="card">{t("admin.partners.loading")}</div>;
  }

  if (!props.loading && !hasItems) {
    return <div className="card">{t("admin.partners.empty")}</div>;
  }

  return (
    <section className="news-admin__section">
      <PartnerCounter total={props.total} />
      <PartnerTable props={props} selection={selection} />
      <PartnerPagination
        page={props.page}
        totalPages={props.totalPages}
        onPrev={props.onPrev}
        onNext={props.onNext}
      />
    </section>
  );
}

function PartnerCounter({ total }: { total: number }) {
  return (
    <div className="news-admin__section-head-number">
      <span className="news-admin__section-meta">
        {total ? `(${total})` : ""}
      </span>
    </div>
  );
}

function PartnerTable({ props, selection }: TableProps) {
  return (
    <div className="news-admin__box news-admin__box--scroll3">
      <div className="news-table">
        <div className="news-admin__top-actions">
          <PartnerBulkToolbar props={props} selection={selection} />
        </div>

        <div className="news-table__scroll">
          <section className="card news-list">
            <div className="news-list__table">
              <PartnerTableHead />
              <PartnerRows props={props} selection={selection} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PartnerBulkToolbar({ props, selection }: BulkToolbarProps) {
  return (
    <PartnerBulkActions
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

function PartnerRows({ props, selection }: TableProps) {
  return (
    <ul className="list list--bleed partner-admin__list">
      {props.items.map((item) => {
        const id = getPartnerId(item);

        return (
          <PartnerCard
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

function PartnerTableHead() {
  const { t } = useTranslation();

  return (
    <div className="news-list__head partner-admin__head-row" aria-hidden="true">
      <div className="news-list__h">{t("admin.partners.table.logo")}</div>
      <div className="news-list__h">{t("admin.partners.table.name")}</div>
      <div className="news-list__h">{t("admin.partners.table.url")}</div>
      <div className="news-list__h">{t("admin.partners.table.order")}</div>
      <div className="news-list__h">{t("admin.partners.table.status")}</div>
      <div className="news-list__h">{t("admin.partners.table.updated")}</div>
      <div className="news-list__h news-list__h--right">
        {t("admin.partners.table.actions")}
      </div>
    </div>
  );
}

function usePartnerSelection(items: Partner[]) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const clearRef = useRef<HTMLButtonElement | null>(null);
  const ids = useMemo(() => items.map(getPartnerId).filter(Boolean), [items]);
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

function getSelectedItems(items: Partner[], selectedIds: Set<string>) {
  return items.filter((item) => selectedIds.has(getPartnerId(item)));
}

type SelectionState = ReturnType<typeof usePartnerSelection>;

type TableProps = {
  props: Props;
  selection: SelectionState;
};

type BulkToolbarProps = {
  props: Props;
  selection: SelectionState;
};
