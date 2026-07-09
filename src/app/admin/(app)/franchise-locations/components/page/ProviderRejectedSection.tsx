import { countLabel, viewLabelProvider } from "../../page.helpers";
import { provRejectedPagination } from "./pagination";
import TableLocationsSection from "./TableLocationsSection";
import type { DeleteHandlers, PageState, TFn } from "./types";

export default function ProviderRejectedSection(props: {
  p: PageState;
  t: TFn;
  handlers: DeleteHandlers;
}) {
  const { p, t, handlers } = props;
  return (
    <TableLocationsSection title={viewLabelProvider("provider_rejected", t)} meta={countLabel(p.provRejectedAllCount, "provider_rejected", t)} items={p.pagProvRejected.items} rowMode="provider_rejected" selectMode={p.provRejectedSelectMode} onToggleSelectMode={p.toggleProvRejectedSelectMode} busy={false} onOpen={p.openEdit} onInfo={p.openInfo} onDeleteOne={handlers.openDeleteAdmin} onDeleteMany={p.deleteManyAdmin} toggleBtnRef={p.provRejectedToggleRef} pagination={provRejectedPagination(p)} p={p} />
  );
}
