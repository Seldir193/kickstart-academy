import type { News } from "../../types";
import NewsTableList from "../../components/NewsTableList";
import NewsSection from "./NewsSection";
import type { DeleteDialogState, NewsAdminViewModel } from "./types";

export default function MineNewsSections({ p, d }: Props) {
  return <>{pendingMine(p, d)}{approvedMine(p, d)}{rejectedMine(p, d)}</>;
}

function pendingMine(p: NewsAdminViewModel, d: DeleteDialogState) {
  if (p.isSuper) return null;
  return (
    <NewsSection titleKey="common.admin.news.page.myNewsPendingReview" meta={p.myPendingMeta} page={p.minePending.page} pages={p.minePending.pages} onPrev={p.minePendingPrev} onNext={p.minePendingNext}>
      <NewsTableList items={p.myPendingItems as any} rowMode="mine_pending" selectMode={p.minePendingSelectMode} onToggleSelectMode={p.toggleMinePendingSelectMode} busy={p.busy} onOpen={(n: News) => p.onOpenEdit(n)} onInfo={p.onInfo} onDeleteOne={d.openDelete} onDeleteMany={p.onDeleteMany} toggleBtnRef={p.minePendingToggleRef} />
    </NewsSection>
  );
}

function approvedMine(p: NewsAdminViewModel, d: DeleteDialogState) {
  return (
    <NewsSection titleKey="common.admin.news.page.myNewsApproved" meta={p.myApprovedMeta} page={p.mineApprovedPage} pages={p.mineApprovedPages} onPrev={p.mineApprovedPrevEffective} onNext={p.mineApprovedNextEffective}>
      <NewsTableList items={p.myApprovedItemsEffective as any} rowMode="mine_approved" selectMode={p.mineApprovedSelectMode} onToggleSelectMode={p.toggleMineApprovedSelectMode} busy={p.busy} onOpen={(n: News) => p.onOpenEdit(n)} onInfo={p.onInfo} onAskReject={p.isSuper ? p.onAskReject : undefined} onSubmitForReview={!p.isSuper ? p.onSubmitForReviewApprovedMine : undefined} onDeleteOne={d.openDelete} onDeleteMany={p.onDeleteMany} onTogglePublished={p.onTogglePublished} publishedBusyId={p.publishedBusyId} toggleBtnRef={p.mineApprovedToggleRef} />
    </NewsSection>
  );
}

function rejectedMine(p: NewsAdminViewModel, d: DeleteDialogState) {
  if (p.isSuper) return null;
  return (
    <NewsSection titleKey="common.admin.news.page.myNewsRejected" meta={p.myRejectedMeta} page={p.mineRejected.page} pages={p.mineRejected.pages} onPrev={p.mineRejectedPrev} onNext={p.mineRejectedNext}>
      <NewsTableList items={p.myRejectedItems as any} rowMode="mine_rejected" selectMode={p.mineRejectedSelectMode} onToggleSelectMode={p.toggleMineRejectedSelectMode} busy={p.busy} onOpen={(n: News) => p.onOpenEdit(n)} onInfo={p.onInfo} onResubmit={p.onResubmitMine} onDeleteOne={d.openDelete} onDeleteMany={p.onDeleteMany} toggleBtnRef={p.mineRejectedToggleRef} />
    </NewsSection>
  );
}

type Props = { p: NewsAdminViewModel; d: DeleteDialogState };
