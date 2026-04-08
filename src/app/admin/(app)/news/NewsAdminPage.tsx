"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { News } from "./types";
import Pagination from "./components/Pagination";
import NewsDialog from "./components/NewsDialog";
import NewsFilters from "./components/NewsFilters";
import PendingNewsList from "./components/PendingNewsList";
import NewsTableList from "./components/NewsTableList";
import DeleteNewsDialog from "./moderation/DeleteNewsDialog";
import RejectDialog from "./moderation/RejectDialog";
import NewsInfoDialog from "./moderation/NewsInfoDialog";
import { getId } from "./newsAdmin/helpers";
import { useNewsAdminViewModel } from "./newsAdmin/useNewsAdminViewModel";

function CreateButton({ busy, onOpen }: { busy: boolean; onOpen: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      className="btn"
      type="button"
      onClick={() => {
        if (busy) return;
        onOpen();
      }}
    >
      <img
        src="/icons/plus.svg"
        alt=""
        aria-hidden="true"
        className="btn__icon"
      />
      {t("common.admin.news.page.createPost")}
    </button>
  );
}

export default function NewsAdminPage() {
  const { t } = useTranslation();
  const p = useNewsAdminViewModel();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);

  function openDelete(item: News) {
    setDeleteTarget(item);
    setDeleteOpen(true);
  }

  function closeDelete() {
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    const id = deleteTarget ? getId(deleteTarget) : "";
    if (!id) return;
    await p.onDeleteById(id);
    closeDelete();
  }

  function deleteName(item: News | null) {
    return String(
      item?.title || item?.slug || t("common.admin.news.page.thisPost"),
    ).trim();
  }

  return (
    <div className="news-admin ks">
      <main className="container">
        <NewsFilters
          q={p.q}
          onChangeQ={p.setQ}
          sort={p.sort}
          onChangeSort={p.setSort}
          actionSlot={<CreateButton busy={p.busy} onOpen={p.onOpenCreate} />}
        />

        {p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                {t("common.admin.news.page.providersPendingReview")}
              </h2>
              <span className="news-admin__section-meta">
                {p.providerPendingMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <PendingNewsList
                items={p.providerPending.items as any}
                loading={p.providerPending.loading || p.busy}
                onApprove={p.onApprove}
                onReject={() => {}}
                onAskReject={p.onAskReject}
                onOpen={(n) => p.onOpenEdit(n as any)}
              />
            </div>

            <Pagination
              page={p.providerPending.page}
              pages={p.providerPending.pages}
              onPrev={p.providerPendingPrev}
              onNext={p.providerPendingNext}
            />
          </section>
        ) : null}

        {p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                {t("common.admin.news.page.providersApproved")}
              </h2>
              <span className="news-admin__section-meta">
                {p.providerApprovedMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <NewsTableList
                items={p.providerApproved.items as any}
                rowMode="provider_approved"
                selectMode={p.provApprovedSelectMode}
                onToggleSelectMode={p.toggleProvApprovedSelectMode}
                busy={p.busy}
                onOpen={(n: News) => p.onOpenEdit(n)}
                onInfo={p.onInfo}
                onAskReject={p.onAskReject}
                onDeleteOne={openDelete}
                onDeleteMany={p.onDeleteMany}
                onTogglePublished={p.onTogglePublished}
                publishedBusyId={p.publishedBusyId}
                toggleBtnRef={p.provApprovedToggleRef}
              />
            </div>

            <Pagination
              page={p.providerApproved.page}
              pages={p.providerApproved.pages}
              onPrev={p.providerApprovedPrev}
              onNext={p.providerApprovedNext}
            />
          </section>
        ) : null}

        {p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                {t("common.admin.news.page.providersRejected")}
              </h2>
              <span className="news-admin__section-meta">
                {p.providerRejectedMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <NewsTableList
                items={p.providerRejected.items as any}
                rowMode="provider_rejected"
                selectMode={p.provRejectedSelectMode}
                onToggleSelectMode={p.toggleProvRejectedSelectMode}
                busy={p.busy}
                onOpen={(n: News) => p.onOpenEdit(n)}
                onInfo={p.onInfo}
                onDeleteOne={openDelete}
                onDeleteMany={p.onDeleteMany}
                toggleBtnRef={p.provRejectedToggleRef}
              />
            </div>

            <Pagination
              page={p.providerRejected.page}
              pages={p.providerRejected.pages}
              onPrev={p.providerRejectedPrev}
              onNext={p.providerRejectedNext}
            />
          </section>
        ) : null}

        {p.anyError ? (
          <div className="card" role="alert">
            <div className="text-red-600">{p.anyError}</div>
          </div>
        ) : null}

        {!p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                {t("common.admin.news.page.myNewsPendingReview")}
              </h2>
              <span className="news-admin__section-meta">
                {p.myPendingMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <NewsTableList
                items={p.myPendingItems as any}
                rowMode="mine_pending"
                selectMode={p.minePendingSelectMode}
                onToggleSelectMode={p.toggleMinePendingSelectMode}
                busy={p.busy}
                onOpen={(n: News) => p.onOpenEdit(n)}
                onInfo={p.onInfo}
                onDeleteOne={openDelete}
                onDeleteMany={p.onDeleteMany}
                toggleBtnRef={p.minePendingToggleRef}
              />
            </div>

            <Pagination
              page={p.minePending.page}
              pages={p.minePending.pages}
              onPrev={p.minePendingPrev}
              onNext={p.minePendingNext}
            />
          </section>
        ) : null}

        <section className="news-admin__section">
          <div className="news-admin__section-head">
            <h2 className="news-admin__section-title">
              {" "}
              {t("common.admin.news.page.myNewsApproved")}
            </h2>
            <span className="news-admin__section-meta">{p.myApprovedMeta}</span>
          </div>

          <div className="news-admin__box news-admin__box--scroll3">
            <NewsTableList
              items={p.myApprovedItemsEffective as any}
              rowMode="mine_approved"
              selectMode={p.mineApprovedSelectMode}
              onToggleSelectMode={p.toggleMineApprovedSelectMode}
              busy={p.busy}
              onOpen={(n: News) => p.onOpenEdit(n)}
              onInfo={p.onInfo}
              onAskReject={p.isSuper ? p.onAskReject : undefined}
              onSubmitForReview={
                !p.isSuper ? p.onSubmitForReviewApprovedMine : undefined
              }
              onDeleteOne={openDelete}
              onDeleteMany={p.onDeleteMany}
              onTogglePublished={p.onTogglePublished}
              publishedBusyId={p.publishedBusyId}
              toggleBtnRef={p.mineApprovedToggleRef}
            />
          </div>

          <Pagination
            page={p.mineApprovedPage}
            pages={p.mineApprovedPages}
            onPrev={p.mineApprovedPrevEffective}
            onNext={p.mineApprovedNextEffective}
          />
        </section>

        {!p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                {" "}
                {t("common.admin.news.page.myNewsRejected")}
              </h2>
              <span className="news-admin__section-meta">
                {p.myRejectedMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <NewsTableList
                items={p.myRejectedItems as any}
                rowMode="mine_rejected"
                selectMode={p.mineRejectedSelectMode}
                onToggleSelectMode={p.toggleMineRejectedSelectMode}
                busy={p.busy}
                onOpen={(n: News) => p.onOpenEdit(n)}
                onInfo={p.onInfo}
                onResubmit={p.onResubmitMine}
                onDeleteOne={openDelete}
                onDeleteMany={p.onDeleteMany}
                toggleBtnRef={p.mineRejectedToggleRef}
              />
            </div>

            <Pagination
              page={p.mineRejected.page}
              pages={p.mineRejected.pages}
              onPrev={p.mineRejectedPrev}
              onNext={p.mineRejectedNext}
            />
          </section>
        ) : null}
      </main>

      {p.createOpen ? (
        <NewsDialog
          mode="create"
          initial={null}
          onClose={p.onCloseCreate}
          upload={p.upload}
          save={p.onSave}
          remove={p.onDeleteById}
        />
      ) : null}

      {p.editItem ? (
        <NewsDialog
          mode="edit"
          initial={p.editItem}
          onClose={p.onCloseEdit}
          upload={p.upload}
          save={p.onSave}
          remove={async (id: string) => {
            const nextId = id || getId(p.editItem) || "";
            if (!nextId) return;
            await p.onDeleteById(nextId);
            p.onCloseEdit();
          }}
        />
      ) : null}

      <DeleteNewsDialog
        open={deleteOpen}
        newsTitle={deleteName(deleteTarget)}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />

      {p.rejectOpen ? (
        <RejectDialog
          open={p.rejectOpen}
          title={p.rejectTitle}
          onClose={p.onCloseReject}
          onSubmit={p.onSubmitReject}
        />
      ) : null}

      {p.infoOpen ? (
        <NewsInfoDialog
          open={p.infoOpen}
          item={p.infoTarget}
          onClose={p.onCloseInfo}
        />
      ) : null}

      {p.previewHref ? (
        <div className="news-admin__hint">
          <a
            className="btn"
            href={p.previewHref}
            target="_blank"
            rel="noreferrer"
          >
            {t("common.admin.news.page.openWordpressPreview")}
          </a>
        </div>
      ) : null}
    </div>
  );
}
