import { countLabel, viewLabelMine } from "../../page.helpers";
import { mineRejectedPagination } from "./pagination";
import TableLocationsSection from "./TableLocationsSection";
import type { DeleteHandlers, PageState, TFn } from "./types";

export default function MineRejectedSection(props: {
  p: PageState;
  t: TFn;
  handlers: DeleteHandlers;
}) {
  const { p, t, handlers } = props;
  return (
    <TableLocationsSection title={viewLabelMine("mine_rejected", t)} meta={countLabel(p.mineRejectedAllCount, "mine_rejected", t)} items={p.pagMineRejected.items} rowMode="mine_rejected" selectMode={p.mineRejectedSelectMode} onToggleSelectMode={p.toggleMineRejectedSelectMode} busy={false} onOpen={p.openEdit} onInfo={p.openInfo} onResubmit={p.submitMine} onDeleteOne={handlers.openDeleteMine} onDeleteMany={p.deleteManyMine} toggleBtnRef={p.mineRejectedToggleRef} pagination={mineRejectedPagination(p)} p={p} />
  );
}
