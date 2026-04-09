"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toastText } from "@/lib/toast-messages";
import FranchiseLocationDialog from "./FranchiseLocationDialog";
import LocationsTableList from "./components/LocationsTableList";
import PendingLocationsList from "./components/PendingLocationsList";
import Pagination from "./components/Pagination";
import DeleteLocationDialog from "./moderation/DeleteLocationDialog";
import RejectDialog from "./moderation/RejectDialog";
import LicenseeInfoDialog from "./moderation/LicenseeInfoDialog";
import SortSelect from "./components/SortSelect";
import { viewLabelMine, viewLabelProvider, countLabel } from "./page.helpers";
import { useFranchiseLocationsPage } from "./hooks/useFranchiseLocationsPage";
import type { FranchiseLocation } from "./types";

function sectionHead(title: string, meta: string, pending?: boolean) {
  const headClass = pending
    ? "news-admin__pending-head"
    : "news-admin__section-head";
  const titleClass = pending
    ? "news-admin__pending-title"
    : "news-admin__section-title";
  const metaClass = pending
    ? "news-admin__pending-meta"
    : "news-admin__section-meta";

  return (
    <div className={headClass}>
      <div className={titleClass}>{title}</div>
      <div className={metaClass}>{meta}</div>
    </div>
  );
}

function locationName(
  item: FranchiseLocation | null,
  t: (key: string) => string,
) {
  const city = String(item?.city || "").trim();
  const country = String(item?.country || "").trim();
  const first = String(item?.licenseeFirstName || "").trim();
  const last = String(item?.licenseeLastName || "").trim();
  const fullName = `${first} ${last}`.trim();
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (fullName) return fullName;
  return toastText(
    t,
    "common.admin.franchiseLocations.deleteFallbackLocation",
    "this location",
  );
}

export default function FranchiseLocationsPage() {
  const p = useFranchiseLocationsPage();
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FranchiseLocation | null>(
    null,
  );
  const [deleteMode, setDeleteMode] = useState<"mine" | "admin">("mine");

  function openDeleteMine(item: FranchiseLocation) {
    setDeleteTarget(item);
    setDeleteMode("mine");
    setDeleteOpen(true);
  }

  function openDeleteAdmin(item: FranchiseLocation) {
    setDeleteTarget(item);
    setDeleteMode("admin");
    setDeleteOpen(true);
  }

  function closeDelete() {
    setDeleteOpen(false);
    setDeleteTarget(null);
    setDeleteMode("mine");
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) return;
    if (deleteMode === "admin") {
      await p.deleteOneAdmin(deleteTarget);
    } else {
      await p.removeMineOne(deleteTarget.id);
    }
    closeDelete();
  }

  return (
    <div className="franchise-locations fl-admin ks">
      <main className="container">
        {p.notice ? (
          <div className={`toast ${p.notice.type}`}>{p.notice.text}</div>
        ) : null}

        <div className="fl-filters__row fl-filters__row--top">
          <div className="fl-filters__search">
            <div className="input-with-icon">
              <img
                src="/icons/search.svg"
                alt=""
                aria-hidden="true"
                className="input-with-icon__icon"
              />
              <input
                className="input input-with-icon__input"
                placeholder={t(
                  "common.admin.franchiseLocations.searchPlaceholder",
                )}
                aria-label={t("common.admin.franchiseLocations.searchAria")}
                value={p.q}
                onChange={(e) => p.setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") p.setQ("");
                }}
              />
            </div>
          </div>

          <div className="fl-filters__sort">
            <SortSelect value={p.sort} onChange={p.setSort} />
          </div>

          <div className="fl-filters__action">
            <button
              className="btn btn--primary"
              type="button"
              onClick={p.openCreate}
            >
              <img
                src="/icons/plus.svg"
                alt=""
                aria-hidden="true"
                className="btn__icon"
              />
              {t("common.admin.franchiseLocations.newLocation")}
            </button>
          </div>
        </div>

        {p.loading ? (
          <div className="card">
            {t("common.admin.franchiseLocations.loading")}
          </div>
        ) : null}
        {p.err ? <div className="card text-red-600">{p.err}</div> : null}

        {!p.loading && !p.err ? (
          <>
            {p.superAdmin ? (
              <>
                <section className="news-admin__section">
                  {sectionHead(
                    viewLabelProvider("provider_pending", t),
                    countLabel(p.provPendingAllCount, "provider_pending", t),
                    true,
                  )}
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

                  <Pagination
                    page={p.pagProvPending.page}
                    totalPages={p.pagProvPending.pages}
                    onPrev={p.prevProvPending}
                    onNext={p.nextProvPending}
                  />
                </section>

                <section className="news-admin__section">
                  {sectionHead(
                    viewLabelProvider("provider_approved", t),
                    countLabel(p.provApprovedAllCount, "provider_approved", t),
                  )}
                  <div className="fl-admin__box fl-admin__box--scroll3">
                    <LocationsTableList
                      items={p.pagProvApproved.items}
                      rowMode="provider_approved"
                      selectMode={p.provApprovedSelectMode}
                      onToggleSelectMode={p.toggleProvApprovedSelectMode}
                      busy={false}
                      publishedBusyId={p.publishedBusyId}
                      onTogglePublished={p.togglePublished}
                      onOpen={p.openEdit}
                      onInfo={p.openInfo}
                      onAskReject={p.openReject}
                      onDeleteOne={openDeleteAdmin}
                      onDeleteMany={p.deleteManyAdmin}
                      toggleBtnRef={p.provApprovedToggleRef}
                    />
                  </div>

                  <Pagination
                    page={p.pagProvApproved.page}
                    totalPages={p.pagProvApproved.pages}
                    onPrev={p.prevProvApproved}
                    onNext={p.nextProvApproved}
                  />
                </section>

                <section className="news-admin__section">
                  {sectionHead(
                    viewLabelProvider("provider_rejected", t),
                    countLabel(p.provRejectedAllCount, "provider_rejected", t),
                  )}
                  <div className="fl-admin__box fl-admin__box--scroll3">
                    <LocationsTableList
                      items={p.pagProvRejected.items}
                      rowMode="provider_rejected"
                      selectMode={p.provRejectedSelectMode}
                      onToggleSelectMode={p.toggleProvRejectedSelectMode}
                      busy={false}
                      onOpen={p.openEdit}
                      onInfo={p.openInfo}
                      onDeleteOne={openDeleteAdmin}
                      onDeleteMany={p.deleteManyAdmin}
                      toggleBtnRef={p.provRejectedToggleRef}
                    />
                  </div>

                  <Pagination
                    page={p.pagProvRejected.page}
                    totalPages={p.pagProvRejected.pages}
                    onPrev={p.prevProvRejected}
                    onNext={p.nextProvRejected}
                  />
                </section>

                <section className="news-admin__section">
                  {sectionHead(
                    viewLabelMine("mine_approved", t),
                    countLabel(p.mineApprovedAllCount, "mine_approved", t),
                  )}
                  <div className="fl-admin__box fl-admin__box--scroll3">
                    <LocationsTableList
                      items={p.pagMineApproved.items}
                      rowMode="mine_approved"
                      selectMode={p.mineApprovedSelectMode}
                      onToggleSelectMode={p.toggleMineApprovedSelectMode}
                      busy={false}
                      publishedBusyId={p.publishedBusyId}
                      onTogglePublished={p.togglePublished}
                      onOpen={p.openEdit}
                      onInfo={p.openInfo}
                      onDeleteOne={openDeleteMine}
                      onDeleteMany={p.deleteManyMine}
                      toggleBtnRef={p.mineApprovedToggleRef}
                    />
                  </div>

                  <Pagination
                    page={p.pagMineApproved.page}
                    totalPages={p.pagMineApproved.pages}
                    onPrev={p.prevMineApproved}
                    onNext={p.nextMineApproved}
                  />
                </section>
              </>
            ) : (
              <>
                <section className="news-admin__section">
                  {sectionHead(
                    viewLabelMine("mine_pending", t),
                    countLabel(p.minePendingAllCount, "mine_pending", t),
                  )}
                  <div className="fl-admin__box fl-admin__box--scroll3">
                    <LocationsTableList
                      items={p.pagMinePending.items}
                      rowMode="mine_pending"
                      selectMode={p.minePendingSelectMode}
                      onToggleSelectMode={p.toggleMinePendingSelectMode}
                      busy={false}
                      onOpen={p.openEdit}
                      onDeleteOne={openDeleteMine}
                      onDeleteMany={p.deleteManyMine}
                      toggleBtnRef={p.minePendingToggleRef}
                    />
                  </div>

                  <Pagination
                    page={p.pagMinePending.page}
                    totalPages={p.pagMinePending.pages}
                    onPrev={p.prevMinePending}
                    onNext={p.nextMinePending}
                  />
                </section>

                <section className="news-admin__section">
                  {sectionHead(
                    viewLabelMine("mine_approved", t),
                    countLabel(p.mineApprovedAllCount, "mine_approved", t),
                  )}
                  <div className="fl-admin__box fl-admin__box--scroll3">
                    <LocationsTableList
                      items={p.pagMineApproved.items}
                      rowMode="mine_approved"
                      selectMode={p.mineApprovedSelectMode}
                      onToggleSelectMode={p.toggleMineApprovedSelectMode}
                      busy={false}
                      publishedBusyId={p.publishedBusyId}
                      onTogglePublished={p.togglePublished}
                      onOpen={p.openEdit}
                      onInfo={p.openInfo}
                      onSubmitForReview={p.submitMine}
                      onDeleteOne={openDeleteMine}
                      onDeleteMany={p.deleteManyMine}
                      toggleBtnRef={p.mineApprovedToggleRef}
                    />
                  </div>

                  <Pagination
                    page={p.pagMineApproved.page}
                    totalPages={p.pagMineApproved.pages}
                    onPrev={p.prevMineApproved}
                    onNext={p.nextMineApproved}
                  />
                </section>

                <section className="news-admin__section">
                  {sectionHead(
                    viewLabelMine("mine_rejected", t),
                    countLabel(p.mineRejectedAllCount, "mine_rejected", t),
                  )}
                  <div className="fl-admin__box fl-admin__box--scroll3">
                    <LocationsTableList
                      items={p.pagMineRejected.items}
                      rowMode="mine_rejected"
                      selectMode={p.mineRejectedSelectMode}
                      onToggleSelectMode={p.toggleMineRejectedSelectMode}
                      busy={false}
                      onOpen={p.openEdit}
                      onInfo={p.openInfo}
                      onResubmit={p.submitMine}
                      onDeleteOne={openDeleteMine}
                      onDeleteMany={p.deleteManyMine}
                      toggleBtnRef={p.mineRejectedToggleRef}
                    />
                  </div>

                  <Pagination
                    page={p.pagMineRejected.page}
                    totalPages={p.pagMineRejected.pages}
                    onPrev={p.prevMineRejected}
                    onNext={p.nextMineRejected}
                  />
                </section>
              </>
            )}
          </>
        ) : null}
      </main>

      <FranchiseLocationDialog
        open={p.openDialog}
        initial={p.edit}
        onClose={p.closeDialog}
        onSave={p.saveLocation}
        onDelete={p.edit?.id ? () => openDeleteMine(p.edit!) : undefined}
      />

      <DeleteLocationDialog
        open={deleteOpen}
        locationName={locationName(deleteTarget, t)}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />

      <RejectDialog
        open={p.rejectOpen}
        onClose={p.closeRejectDialog}
        onSubmit={p.submitReject}
      />

      <LicenseeInfoDialog
        open={p.infoOpen}
        item={p.infoItem}
        onClose={p.closeInfoDialog}
      />
    </div>
  );
}
