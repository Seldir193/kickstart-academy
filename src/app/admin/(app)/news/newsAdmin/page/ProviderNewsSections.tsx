import type { News } from "../../types";
import PendingNewsList from "../../components/PendingNewsList";
import NewsTableList from "../../components/NewsTableList";
import NewsSection from "./NewsSection";
import type { DeleteDialogState, NewsAdminViewModel } from "./types";

export default function ProviderNewsSections({ p, d }: Props) {
  if (!p.isSuper) return null;
  return (
    <>
      {pendingSection(p)}
      {approvedSection(p, d)}
      {rejectedSection(p, d)}
    </>
  );
}

function pendingSection(p: NewsAdminViewModel) {
  return (
    <NewsSection
      titleKey="common.admin.news.page.providersPendingReview"
      meta={p.providerPendingMeta}
      page={p.providerPending.page}
      pages={p.providerPending.pages}
      onPrev={p.providerPendingPrev}
      onNext={p.providerPendingNext}
    >
      <PendingNewsList
        items={p.providerPending.items as any}
        loading={p.providerPending.loading || p.busy}
        onApprove={p.onApprove}
        onReject={() => {}}
        onAskReject={p.onAskReject}
        onOpen={(n) => p.onOpenEdit(n as any)}
      />
    </NewsSection>
  );
}

function approvedSection(p: NewsAdminViewModel, d: DeleteDialogState) {
  return (
    <NewsSection
      titleKey="common.admin.news.page.providersApproved"
      meta={p.providerApprovedMeta}
      page={p.providerApproved.page}
      pages={p.providerApproved.pages}
      onPrev={p.providerApprovedPrev}
      onNext={p.providerApprovedNext}
    >
      <NewsTableList
        items={p.providerApproved.items as any}
        rowMode="provider_approved"
        selectMode={p.provApprovedSelectMode}
        onToggleSelectMode={p.toggleProvApprovedSelectMode}
        busy={p.busy}
        onOpen={(n: News) => p.onOpenEdit(n)}
        onInfo={p.onInfo}
        onAskReject={p.onAskReject}
        onDeleteOne={d.openDelete}
        onDeleteMany={p.onDeleteMany}
        onTogglePublished={p.onTogglePublished}
        publishedBusyId={p.publishedBusyId}
        toggleBtnRef={p.provApprovedToggleRef}
      />
    </NewsSection>
  );
}

function rejectedSection(p: NewsAdminViewModel, d: DeleteDialogState) {
  return (
    <NewsSection
      titleKey="common.admin.news.page.providersRejected"
      meta={p.providerRejectedMeta}
      page={p.providerRejected.page}
      pages={p.providerRejected.pages}
      onPrev={p.providerRejectedPrev}
      onNext={p.providerRejectedNext}
    >
      <NewsTableList
        items={p.providerRejected.items as any}
        rowMode="provider_rejected"
        selectMode={p.provRejectedSelectMode}
        onToggleSelectMode={p.toggleProvRejectedSelectMode}
        busy={p.busy}
        onOpen={(n: News) => p.onOpenEdit(n)}
        onInfo={p.onInfo}
        onDeleteOne={d.openDelete}
        onDeleteMany={p.onDeleteMany}
        toggleBtnRef={p.provRejectedToggleRef}
      />
    </NewsSection>
  );
}

type Props = { p: NewsAdminViewModel; d: DeleteDialogState };
