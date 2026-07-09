import type { RefObject } from "react";
import BulkActions from "../BulkActions";
import type { LocationsTableListProps, SelectionState } from "./types";

type Props = Pick<LocationsTableListProps, "selectMode" | "busy" | "items" | "onToggleSelectMode" | "toggleBtnRef"> & {
  selection: SelectionState;
  cancelRef: RefObject<HTMLButtonElement | null>;
  clearRef: RefObject<HTMLButtonElement | null>;
  count: number;
  showClear: boolean;
  onDelete: () => void;
};

export default function LocationsBulkActionsBar(p: Props) {
  return <div className="news-admin__top-actions"><BulkActions {...bulkProps(p)} /></div>;
}

function bulkProps(p: Props) {
  return {
    ...bulkRefs(p),
    ...bulkState(p),
    ...bulkHandlers(p),
    showClear: p.showClear,
    onDelete: p.onDelete,
  };
}

function bulkRefs(p: Props) {
  return { toggleRef: p.toggleBtnRef as RefObject<HTMLButtonElement | null>, cancelRef: p.cancelRef, clearRef: p.clearRef };
}

function bulkState(p: Props) {
  return { selectMode: p.selectMode, count: p.count, isAllSelected: p.selection.isAllSelected, disabled: p.busy || p.items.length === 0 };
}

function bulkHandlers(p: Props) {
  return { onToggleSelectMode: () => toggleSelectMode(p), onToggleAll: () => toggleAll(p.selection), onClear: () => clearSelection(p) };
}

function toggleSelectMode(p: Props) {
  p.selection.clear();
  p.onToggleSelectMode();
}

function toggleAll(selection: SelectionState) {
  selection.isAllSelected ? selection.removeAll() : selection.selectAll();
}

function clearSelection(p: Props) {
  p.clearRef.current?.blur();
  p.cancelRef.current?.blur();
  p.selection.clear();
}
