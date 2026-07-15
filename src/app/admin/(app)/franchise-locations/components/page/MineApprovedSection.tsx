import { countLabel, viewLabelMine } from "../../page.helpers";
import { mineApprovedPagination } from "./pagination";
import TableLocationsSection from "./TableLocationsSection";
import type { DeleteHandlers, PageState, TFn } from "./types";

export default function MineApprovedSection(props: {
  p: PageState;
  t: TFn;
  handlers: DeleteHandlers;
  showSubmit?: boolean;
}) {
  const { p, t, handlers, showSubmit } = props;
  return (
    <TableLocationsSection
      title={viewLabelMine("mine_approved", t)}
      meta={countLabel(p.mineApprovedAllCount, "mine_approved", t)}
      items={p.pagMineApproved.items}
      rowMode="mine_approved"
      selectMode={p.mineApprovedSelectMode}
      onToggleSelectMode={p.toggleMineApprovedSelectMode}
      busy={false}
      publishedBusyId={p.publishedBusyId}
      onTogglePublished={p.togglePublished}
      onOpen={p.openEdit}
      onInfo={p.openInfo}
      onSubmitForReview={showSubmit ? p.submitMine : undefined}
      onDeleteOne={handlers.openDeleteMine}
      onDeleteMany={p.deleteManyMine}
      toggleBtnRef={p.mineApprovedToggleRef}
      pagination={mineApprovedPagination(p)}
      p={p}
    />
  );
}
