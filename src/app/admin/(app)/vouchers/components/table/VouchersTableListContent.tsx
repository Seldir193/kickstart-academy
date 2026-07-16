"use client";

import { useTranslation } from "react-i18next";
import VoucherBulkActions from "./VoucherBulkActions";
import VouchersTable from "./VouchersTable";
import { voucherId } from "./vouchersTable.helpers";
import type { VouchersTableListProps } from "./vouchersTable.types";
import { useVoucherBulkActions } from "./useVoucherBulkActions";
import { useVouchersTableSelection } from "./useVouchersTableSelection";

type SelectionState = ReturnType<typeof useVouchersTableSelection>;
type BulkActions = ReturnType<typeof useVoucherBulkActions>;
type VoucherItem = VouchersTableListProps["items"][number];

export default function VouchersTableListContent(
  props: VouchersTableListProps,
) {
  const state = useVouchersTableSelection(props.items, props.selectMode);
  const actions = useVoucherBulkActions(props, state.selection);

  if (!props.items.length) return <EmptyVouchersList busy={props.busy} />;

  return (
    <div className="news-table">
      <VoucherBulkActions {...bulkProps(props, state, actions)} />
      <VouchersTable {...tableProps(props, state)} />
    </div>
  );
}

function EmptyVouchersList({ busy }: { busy: boolean }) {
  const { t } = useTranslation();
  const key = busy
    ? "common.admin.vouchers.list.loading"
    : "common.admin.vouchers.list.empty";
  return (
    <section className="card">
      <div className="card__empty">{t(key)}</div>
    </section>
  );
}

function bulkProps(
  props: VouchersTableListProps,
  state: SelectionState,
  actions: BulkActions,
) {
  return {
    ...props,
    ...actions,
    ...bulkSelection(state),
    ...bulkHandlers(props, state, actions),
  };
}

function bulkSelection(state: SelectionState) {
  return {
    selected: state.selection.selected,
    isAllSelected: state.selection.isAllSelected,
    count: state.count,
    cancelBtnRef: state.cancelBtnRef,
    clearBtnRef: state.clearBtnRef,
  };
}

function bulkHandlers(
  props: VouchersTableListProps,
  state: SelectionState,
  actions: BulkActions,
) {
  return {
    onToggleMode: () =>
      toggleMode(state.selection.clear, props.onToggleSelectMode),
    onToggleAll: () => toggleAll(state.selection),
    onClear: () => clearSelection(state),
    onDelete: actions.deleteSelected,
    onActivate: actions.activateSelected,
    onDeactivate: actions.deactivateSelected,
  };
}

function tableProps(props: VouchersTableListProps, state: SelectionState) {
  return {
    items: props.items,
    selectMode: props.selectMode,
    selected: state.selection.selected,
    onOpen: props.onOpen,
    onRowClick: (item: VoucherItem) => handleRowClick(item, props, state),
  };
}

function handleRowClick(
  item: VoucherItem,
  props: VouchersTableListProps,
  state: SelectionState,
) {
  const id = voucherId(item);
  if (!id) return;
  if (props.selectMode) state.selection.toggleOne(id);
  else props.onOpen(item);
}

function toggleMode(clear: () => void, toggle: () => void) {
  clear();
  toggle();
}

function toggleAll(selection: {
  isAllSelected: boolean;
  removeAll: () => void;
  selectAll: () => void;
}) {
  if (selection.isAllSelected) selection.removeAll();
  else selection.selectAll();
}

function clearSelection(state: SelectionState) {
  state.clearBtnRef.current?.blur();
  state.cancelBtnRef.current?.blur();
  state.selection.clear();
}
