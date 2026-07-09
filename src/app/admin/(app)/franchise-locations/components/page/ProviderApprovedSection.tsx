import { countLabel, viewLabelProvider } from "../../page.helpers";
import { provApprovedPagination } from "./pagination";
import TableLocationsSection from "./TableLocationsSection";
import type { DeleteHandlers, PageState, TFn } from "./types";

export default function ProviderApprovedSection(props: {
  p: PageState;
  t: TFn;
  handlers: DeleteHandlers;
}) {
  const { p, t, handlers } = props;
  return (
    <TableLocationsSection title={viewLabelProvider("provider_approved", t)} meta={countLabel(p.provApprovedAllCount, "provider_approved", t)} items={p.pagProvApproved.items} rowMode="provider_approved" selectMode={p.provApprovedSelectMode} onToggleSelectMode={p.toggleProvApprovedSelectMode} busy={false} publishedBusyId={p.publishedBusyId} onTogglePublished={p.togglePublished} onOpen={p.openEdit} onInfo={p.openInfo} onAskReject={p.openReject} onDeleteOne={handlers.openDeleteAdmin} onDeleteMany={p.deleteManyAdmin} toggleBtnRef={p.provApprovedToggleRef} pagination={provApprovedPagination(p)} p={p} />
  );
}
