import { countLabel, viewLabelMine } from "../../page.helpers";
import { minePendingPagination } from "./pagination";
import TableLocationsSection from "./TableLocationsSection";
import type { DeleteHandlers, PageState, TFn } from "./types";

export default function MinePendingSection(props: {
  p: PageState;
  t: TFn;
  handlers: DeleteHandlers;
}) {
  const { p, t, handlers } = props;
  return (
    <TableLocationsSection title={viewLabelMine("mine_pending", t)} meta={countLabel(p.minePendingAllCount, "mine_pending", t)} items={p.pagMinePending.items} rowMode="mine_pending" selectMode={p.minePendingSelectMode} onToggleSelectMode={p.toggleMinePendingSelectMode} busy={false} onOpen={p.openEdit} onDeleteOne={handlers.openDeleteMine} onDeleteMany={p.deleteManyMine} toggleBtnRef={p.minePendingToggleRef} pagination={minePendingPagination(p)} p={p} />
  );
}
