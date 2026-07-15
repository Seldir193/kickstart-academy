import type { RefObject } from "react";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import { getRestoreIds } from "../lib/bookingRow";
import type { BookingsTableListProps, Translator } from "../types";
import type { useBookingsTableSelection } from "../hooks/useBookingsTableSelection";

type Props = BookingsTableListProps & {
  table: ReturnType<typeof useBookingsTableSelection>;
  t: Translator;
};

export default function BookingsTableBulkActions(props: Props) {
  return (
    <div className="news-admin__top-actions">
      <BulkActions {...bulkProps(props)} />
      <RestoreButton {...props} />
    </div>
  );
}

function RestoreButton(props: Props) {
  if (!props.selectMode || !props.table.restoreCount) return null;

  return (
    <button
      type="button"
      className="btn"
      disabled={props.busy}
      onClick={() => restoreSelected(props)}
    >
      {props.t("common.admin.onlineBookings.bulk.restoreLabel")} (
      {props.table.restoreCount})
    </button>
  );
}

function bulkProps(props: Props) {
  return {
    ...bulkRefs(props),
    ...bulkState(props),
    ...bulkHandlers(props),
    ...bulkLabels(props.t),
  };
}

function bulkRefs(props: Props) {
  return {
    toggleRef: props.toggleBtnRef as RefObject<HTMLButtonElement | null>,
    cancelRef: props.table.cancelBtnRef,
    clearRef: props.table.clearBtnRef,
  };
}

function bulkState(props: Props) {
  return {
    selectMode: props.selectMode,
    count: props.table.count,
    isAllSelected: props.table.sel.isAllSelected,
    busy: props.busy,
    isEmpty: props.items.length === 0,
    showClear: props.selectMode && props.table.count >= 2,
  };
}

function bulkHandlers(props: Props) {
  return {
    onToggleSelectMode: () => toggleSelectMode(props),
    onToggleAll: () => toggleAll(props),
    onClear: () => clearSelection(props),
    onDelete: () => deleteSelected(props),
  };
}

function bulkLabels(t: Translator) {
  return {
    toggleLabel: t("common.admin.onlineBookings.bulk.toggleLabel"),
    selectedLabel: t("common.admin.onlineBookings.bulk.selectedLabel"),
    selectAllLabel: t("common.admin.onlineBookings.bulk.selectAllLabel"),
    clearAllLabel: t("common.admin.onlineBookings.bulk.clearAllLabel"),
    deleteLabel: t("common.admin.onlineBookings.bulk.deleteLabel"),
    cancelLabel: t("common.admin.onlineBookings.bulk.cancelLabel"),
  };
}

async function deleteSelected(props: Props) {
  const ids = Array.from(props.table.sel.selected);
  if (!ids.length) return;
  await props.onDeleteMany(ids);
  resetSelection(props);
}

async function restoreSelected(props: Props) {
  const ids = getRestoreIds(props.items, props.table.sel.selected);
  if (!ids.length) return;
  await props.onRestoreMany(ids);
  resetSelection(props);
}

function toggleSelectMode(props: Props) {
  props.table.sel.clear();
  props.onToggleSelectMode();
}

function toggleAll(props: Props) {
  props.table.sel.isAllSelected
    ? props.table.sel.removeAll()
    : props.table.sel.selectAll();
}

function clearSelection(props: Props) {
  blurActionRefs(props);
  props.table.sel.clear();
}

function resetSelection(props: Props) {
  props.table.sel.clear();
  props.onToggleSelectMode();
}

function blurActionRefs(props: Props) {
  props.table.clearBtnRef.current?.blur();
  props.table.cancelBtnRef.current?.blur();
}
