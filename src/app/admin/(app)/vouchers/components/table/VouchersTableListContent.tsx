"use client";

import { useTranslation } from "react-i18next";
import VoucherBulkActions from "./VoucherBulkActions";
import VouchersTable from "./VouchersTable";
import { voucherId } from "./vouchersTable.helpers";
import type { VouchersTableListProps } from "./vouchersTable.types";
import { useVoucherBulkActions } from "./useVoucherBulkActions";
import { useVouchersTableSelection } from "./useVouchersTableSelection";

export default function VouchersTableListContent(
  props: VouchersTableListProps,
) {
  const state = useVouchersTableSelection(props.items, props.selectMode);
  const actions = useVoucherBulkActions(props, state.selection);
  const onToggleMode = () =>
    toggleMode(state.selection.clear, props.onToggleSelectMode);
  const onToggleAll = () => toggleAll(state.selection);
  const onClear = () => clearSelection(state);
  const onRowClick = (item: VouchersTableListProps["items"][number]) => {
    const id = voucherId(item);
    if (!id) return;
    if (props.selectMode) state.selection.toggleOne(id);
    else props.onOpen(item);
  };

  if (!props.items.length) return <EmptyVouchersList busy={props.busy} />;

  return (
    <div className="news-table">
      <VoucherBulkActions
        {...props}
        {...actions}
        selected={state.selection.selected}
        isAllSelected={state.selection.isAllSelected}
        count={state.count}
        cancelBtnRef={state.cancelBtnRef}
        clearBtnRef={state.clearBtnRef}
        onToggleMode={onToggleMode}
        onToggleAll={onToggleAll}
        onClear={onClear}
        onDelete={actions.deleteSelected}
        onActivate={actions.activateSelected}
        onDeactivate={actions.deactivateSelected}
      />
      <VouchersTable
        items={props.items}
        selectMode={props.selectMode}
        selected={state.selection.selected}
        onOpen={props.onOpen}
        onRowClick={onRowClick}
      />
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

function clearSelection(state: ReturnType<typeof useVouchersTableSelection>) {
  state.clearBtnRef.current?.blur();
  state.cancelBtnRef.current?.blur();
  state.selection.clear();
}
