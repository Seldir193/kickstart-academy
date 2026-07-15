import type { RefObject } from "react";
import BulkActions from "../../BulkActions";
import type { Props } from "./NewsTableListProps";
import type { Translate } from "../types";
import type { NewsTableState } from "../hooks/useNewsTableState";

type BulkProps = {
  props: Props;
  state: NewsTableState;
  t: Translate;
};

export function NewsBulkActions({ props, state, t }: BulkProps) {
  return (
    <div className="news-admin__top-actions">
      <BulkActions {...bulkProps(props, state, t)} />
    </div>
  );
}

function bulkProps(props: Props, state: NewsTableState, t: Translate) {
  return {
    ...bulkRefs(props, state),
    ...bulkState(props, state),
    ...bulkHandlers(props, state),
    ...bulkLabels(t),
  };
}

function bulkRefs(props: Props, state: NewsTableState) {
  return {
    toggleRef: props.toggleBtnRef as RefObject<HTMLButtonElement | null>,
    cancelRef: state.refs.cancelBtnRef,
    clearRef: state.refs.clearBtnRef,
  };
}

function bulkState(props: Props, state: NewsTableState) {
  return {
    selectMode: props.selectMode,
    count: state.count,
    isAllSelected: state.selection.isAllSelected,
    busy: props.busy,
    isEmpty: state.viewItems.length === 0,
    showClear: state.showClear,
    canDelete: Boolean(props.onDeleteMany),
  };
}

function bulkHandlers(props: Props, state: NewsTableState) {
  return {
    onToggleSelectMode: () => toggleSelectMode(props, state),
    onToggleAll: () => toggleAll(state),
    onClear: () => clearSelection(props, state),
    onDelete: () => void deleteSelected(props, state),
  };
}

function bulkLabels(t: Translate) {
  return {
    toggleLabel: t("common.admin.news.table.selectNews"),
    selectedLabel: t("common.admin.news.table.selected"),
    selectAllLabel: t("common.admin.news.table.selectAll"),
    clearAllLabel: t("common.admin.news.table.clearAll"),
    deleteLabel: t("common.delete"),
    cancelLabel: t("common.cancel"),
  };
}

async function deleteSelected(props: Props, state: NewsTableState) {
  if (!props.onDeleteMany) return;
  const ids = Array.from(state.selection.selected);
  if (!ids.length) return;
  await props.onDeleteMany(ids);
  state.selection.clear();
  props.onToggleSelectMode();
}

function toggleSelectMode(props: Props, state: NewsTableState) {
  state.selection.clear();
  props.onToggleSelectMode();
}

function toggleAll(state: NewsTableState) {
  state.selection.isAllSelected
    ? state.selection.removeAll()
    : state.selection.selectAll();
}

function clearSelection(props: Props, state: NewsTableState) {
  blurSelectionActions(props, state);
  state.selection.clear();
}

function blurSelectionActions(props: Props, state: NewsTableState) {
  state.refs.clearBtnRef.current?.blur();
  state.refs.cancelBtnRef.current?.blur();
  props.toggleBtnRef?.current?.blur();
}
