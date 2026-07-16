import PartnerBulkActions from "../PartnerBulkActions";
import { getPartnerId } from "../../helpers";
import type { PartnerListProps, PartnerSelection } from "./partnerList.types";

type ToolbarView = {
  props: PartnerListProps;
  selection: PartnerSelection;
};

export default function PartnerBulkToolbar(view: ToolbarView) {
  return <PartnerBulkActions {...bulkProps(view)} />;
}

function bulkProps({ props, selection }: ToolbarView) {
  return {
    ...bulkRefs(selection),
    ...bulkState(props, selection),
    ...bulkHandlers(props, selection),
  };
}

function bulkRefs(selection: PartnerSelection) {
  return {
    toggleRef: selection.toggleRef,
    cancelRef: selection.cancelRef,
    clearRef: selection.clearRef,
  };
}

function bulkState(props: PartnerListProps, selection: PartnerSelection) {
  return {
    selectMode: selection.selectMode,
    count: selection.selectedIds.size,
    isAllSelected: selection.isAllSelected,
    disabled: props.loading,
    showClear: selection.selectedIds.size >= 2,
  };
}

function bulkHandlers(props: PartnerListProps, selection: PartnerSelection) {
  return {
    onToggleSelectMode: selection.toggleSelectMode,
    onToggleAll: selection.toggleAll,
    onClear: selection.clearSelection,
    onDeactivate: () => runBulkAction(props, selection, props.onBulkDeactivate),
    onDelete: () => runBulkAction(props, selection, props.onBulkDelete),
  };
}

async function runBulkAction(
  props: PartnerListProps,
  selection: PartnerSelection,
  action: PartnerListProps["onBulkDelete"],
) {
  const selected = props.items.filter((item) =>
    selection.selectedIds.has(getPartnerId(item)),
  );
  if (!selected.length) return;
  await action(selected);
  selection.toggleSelectMode();
}
