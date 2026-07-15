import PendingLocationsList from "../PendingLocationsList";
import LocationsSectionShell from "./LocationsSectionShell";
import type { PendingSectionProps } from "./types";

export default function PendingProviderSection(props: PendingSectionProps) {
  const { title, meta, p, pagination } = props;
  return (
    <LocationsSectionShell
      title={title}
      meta={meta}
      pending
      pagination={pagination}
    >
      <div className="news-admin__box--scroll3">
        <PendingLocationsList
          items={p.pagProvPending.items}
          loading={false}
          showChangeInfo={true}
          onOpen={p.openEdit}
          onApprove={p.approveOne}
          onReject={p.openReject}
        />
      </div>
    </LocationsSectionShell>
  );
}
