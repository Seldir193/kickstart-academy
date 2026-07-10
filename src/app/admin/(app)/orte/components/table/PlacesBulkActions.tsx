"use client";

import type { RefObject } from "react";
import type { TFunction } from "i18next";
import BulkActions from "@/app/admin/(app)/news/components/BulkActions";
import type { PlacesSelection, PlacesTableProps } from "./types";

type Props = {
  props: PlacesTableProps;
  selection: PlacesSelection;
  count: number;
  cancelRef: RefObject<HTMLButtonElement | null>;
  clearRef: RefObject<HTMLButtonElement | null>;
  t: TFunction;
};

export default function PlacesBulkActions(input: Props) {
  return (
    <div className="news-admin__top-actions">
      <BulkActions
        toggleRef={input.props.toggleBtnRef as RefObject<HTMLButtonElement | null>}
        cancelRef={input.cancelRef}
        clearRef={input.clearRef}
        selectMode={input.props.selectMode}
        onToggleSelectMode={() => toggleSelectMode(input)}
        count={input.count}
        isAllSelected={input.selection.isAllSelected}
        busy={input.props.busy}
        isEmpty={input.props.items.length === 0}
        onToggleAll={() => toggleAll(input.selection)}
        onClear={() => clearSelection(input)}
        showClear={input.props.selectMode && input.count >= 2}
        onDelete={() => deleteSelected(input)}
        {...bulkLabels(input.t)}
      />
    </div>
  );
}

function bulkLabels(t: TFunction) {
  return {
    toggleLabel: t("common.admin.places.bulk.toggle", { defaultValue: "Select locations" }),
    selectedLabel: t("common.admin.places.bulk.selected", { defaultValue: "selected" }),
    selectAllLabel: t("common.admin.places.bulk.selectAll", { defaultValue: "Select all" }),
    clearAllLabel: t("common.admin.places.bulk.clearAll", { defaultValue: "Clear all" }),
    deleteLabel: t("common.admin.places.bulk.delete", { defaultValue: "Delete" }),
    cancelLabel: t("common.admin.places.bulk.cancel", { defaultValue: "Cancel" }),
  };
}

function toggleSelectMode({ selection, props }: Props) {
  selection.clear();
  props.onToggleSelectMode();
}

function toggleAll(selection: PlacesSelection) {
  if (selection.isAllSelected) selection.removeAll();
  else selection.selectAll();
}

function clearSelection({ clearRef, cancelRef, selection }: Props) {
  clearRef.current?.blur();
  cancelRef.current?.blur();
  selection.clear();
}

async function deleteSelected({ selection, props }: Props) {
  const ids = Array.from(selection.selected);
  if (!ids.length) return;
  await props.onDeleteMany(ids);
  selection.clear();
  props.onToggleSelectMode();
}
