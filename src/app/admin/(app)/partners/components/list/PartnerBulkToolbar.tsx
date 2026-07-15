import PartnerBulkActions from "../PartnerBulkActions";
import { getPartnerId } from "../../helpers";
import type { PartnerListProps, PartnerSelection } from "./partnerList.types";

export default function PartnerBulkToolbar({
  props,
  selection,
}: {
  props: PartnerListProps;
  selection: PartnerSelection;
}) {
  const deactivate = () =>
    runBulkAction(props, selection, props.onBulkDeactivate);
  const remove = () => runBulkAction(props, selection, props.onBulkDelete);

  return (
    <PartnerBulkActions
      toggleRef={selection.toggleRef}
      cancelRef={selection.cancelRef}
      clearRef={selection.clearRef}
      selectMode={selection.selectMode}
      count={selection.selectedIds.size}
      isAllSelected={selection.isAllSelected}
      disabled={props.loading}
      showClear={selection.selectedIds.size >= 2}
      onToggleSelectMode={selection.toggleSelectMode}
      onToggleAll={selection.toggleAll}
      onClear={selection.clearSelection}
      onDeactivate={deactivate}
      onDelete={remove}
    />
  );
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
