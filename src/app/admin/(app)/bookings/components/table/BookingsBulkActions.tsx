import type { RefObject } from "react";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import type { SelectionState, TFn } from "./types";

type Props = {
  selectMode: boolean;
  count: number;
  restoreCount: number;
  busyDelete: boolean;
  busyRestore: boolean;
  itemsLength: number;
  selection: SelectionState;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
  cancelBtnRef: RefObject<HTMLButtonElement | null>;
  clearBtnRef: RefObject<HTMLButtonElement | null>;
  onToggleSelectMode: () => void;
  onToggleAll: () => void;
  onClear: () => void;
  onDelete: () => void;
  onRestore: () => void;
  t: TFn;
};

export function BookingsBulkActions(props: Props) {
  return (
    <div className="news-admin__top-actions">
      <CoreBulkActions {...props} />
      {props.selectMode ? <RestoreDeleteActions {...props} /> : null}
    </div>
  );
}

function CoreBulkActions(props: Props) {
  return <BulkActions {...bulkActionProps(props)} />;
}

function bulkActionProps(props: Props) {
  return {
    ...bulkRefs(props),
    ...bulkState(props),
    ...bulkHandlers(props),
    ...bulkLabels(props.t),
  };
}

function bulkRefs(props: Props) {
  return {
    toggleRef: props.toggleBtnRef as RefObject<HTMLButtonElement>,
    cancelRef: props.cancelBtnRef as RefObject<HTMLButtonElement>,
    clearRef: props.clearBtnRef as RefObject<HTMLButtonElement>,
  };
}

function bulkState(props: Props) {
  return {
    selectMode: props.selectMode,
    count: props.count,
    isAllSelected: props.selection.isAllSelected,
    busy: false,
    isEmpty: props.itemsLength === 0,
    showClear: props.selectMode && props.count >= 2,
  };
}

function bulkHandlers(props: Props) {
  return {
    onToggleSelectMode: props.onToggleSelectMode,
    onToggleAll: props.onToggleAll,
    onClear: props.onClear,
    onDelete: props.onDelete,
  };
}

function RestoreDeleteActions(props: Props) {
  return (
    <div className="bookings-bulk-actions">
      <RestoreButton {...props} />
      <DeleteButton {...props} />
    </div>
  );
}

function RestoreButton(props: Props) {
  return bulkButton(
    props.t("common.admin.bookings.bulk.restoreLabel"),
    props.restoreCount,
    props.busyRestore || props.restoreCount === 0,
    props.onRestore,
  );
}

function DeleteButton(props: Props) {
  return bulkButton(
    props.t("common.admin.bookings.bulk.deleteLabel"),
    props.count,
    props.busyDelete || props.count === 0,
    props.onDelete,
    "btn btn--danger",
  );
}

function bulkButton(
  label: string,
  count: number,
  disabled: boolean,
  onClick: () => void,
  className = "btn",
) {
  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {label} ({count})
    </button>
  );
}

function bulkLabels(t: TFn) {
  return {
    toggleLabel: t("common.admin.bookings.bulk.toggleLabel"),
    selectedLabel: t("common.admin.bookings.bulk.selectedLabel"),
    selectAllLabel: t("common.admin.bookings.bulk.selectAllLabel"),
    clearAllLabel: t("common.admin.bookings.bulk.clearAllLabel"),
    deleteLabel: t("common.admin.bookings.bulk.deleteLabel"),
    cancelLabel: t("common.admin.bookings.bulk.cancelLabel"),
  };
}
