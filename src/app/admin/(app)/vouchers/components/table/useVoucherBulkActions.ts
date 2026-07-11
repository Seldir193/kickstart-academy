"use client";

import { getActiveVoucherIds, getInactiveVoucherIds } from "./vouchersTable.helpers";
import type { VouchersTableListProps } from "./vouchersTable.types";

type Selection = {
  selected: Set<string>;
  clear: () => void;
};

export function useVoucherBulkActions(
  props: VouchersTableListProps,
  selection: Selection,
) {
  const finish = () => {
    selection.clear();
    props.onToggleSelectMode();
  };

  const deleteSelected = () => runAction([...selection.selected], props.onDeleteMany, finish);
  const activateSelected = () => runAction(
    getInactiveVoucherIds(props.items, selection.selected),
    props.onActivateMany,
    finish,
  );
  const deactivateSelected = () => runAction(
    getActiveVoucherIds(props.items, selection.selected),
    props.onDeactivateMany,
    finish,
  );

  return { deleteSelected, activateSelected, deactivateSelected };
}

async function runAction(
  ids: string[],
  action: (ids: string[]) => Promise<void>,
  finish: () => void,
) {
  if (!ids.length) return;
  await action(ids);
  finish();
}
