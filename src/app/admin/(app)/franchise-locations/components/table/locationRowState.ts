import type { KeyboardEvent } from "react";
import type { FranchiseLocation } from "../../types";
import { actionsFor, idOf, statusParts, type RowMode } from "../LocationsTableList.helpers";
import { getCanToggle, getPublished, isMineRow, isSwitchBusy } from "./locationTableState";
import type { RowCallbacks, SelectionState } from "./types";

type Args = RowCallbacks & {
  item: FranchiseLocation;
  rowMode: RowMode;
  busy: boolean;
  selectMode: boolean;
  selected: boolean;
  publishedBusyId?: string | null;
  selection: SelectionState;
  t: (key: string) => string;
};

export function buildLocationRowState(a: Args) {
  const id = idOf(a.item);
  return {
    id,
    hideActions: a.selectMode || a.selected,
    switchBusy: isSwitchBusy(a.publishedBusyId, id),
    published: getPublished(a.item),
    switchDisabled: getSwitchDisabled(a, id),
    status: statusParts(a.item, a.rowMode, a.t),
    actions: actionsFor({ ...a, it: a.item, t: a.t }),
  };
}

function getSwitchDisabled(a: Args, id: string) {
  const swBusy = isSwitchBusy(a.publishedBusyId, id);
  return a.busy || swBusy || !getCanToggle(a.item, isMineRow(a.rowMode));
}

export function activateRow(args: Pick<Args, "item" | "selectMode" | "selection" | "onOpen">, id: string) {
  if (!id) return;
  if (args.selectMode) return void args.selection.toggleOne(id);
  args.onOpen(args.item);
}

export function handleRowKey(e: KeyboardEvent, run: () => void) {
  if (e.key !== "Enter" && e.key !== " ") return;
  run();
}
