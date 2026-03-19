//src\app\admin\(app)\franchise-locations\page.tsx
"use client";

import React from "react";
import FranchiseLocationDialog from "./FranchiseLocationDialog";
import LocationsTableList from "./components/LocationsTableList";
import PendingLocationsList from "./components/PendingLocationsList";
import Pagination from "./components/Pagination";
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

export default function FranchiseLocationsPage() {
  const p = useFranchiseLocationsPage();

  function deleteMine(it: FranchiseLocation) {
    return void p.removeMineOne(it.id);
  }

  function deleteAdmin(it: FranchiseLocation) {
    return void p.deleteOneAdmin(it);
  }

  return (
    <div className="franchise-locations fl-admin ks">
      <main className="container">
        <div className="dialog-subhead fl-admin__subhead">
          <h1 className="text-2xl font-bold m-0 fl-admin__title">
            {p.superAdmin ? "Standorte verwalten" : "Meine Franchise-Standorte"}
          </h1>

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
            Neuer Standort
          </button>
        </div>

        {p.notice ? (
          <div className={`toast ${p.notice.type}`}>{p.notice.text}</div>
        ) : null}

        <div className="fl-filters__row">
          <div className="fl-filters__search">
            <label className="lbl fl-filters__label">Suche</label>
            <div className="input-with-icon">
              <img
                src="/icons/search.svg"
                alt=""
                aria-hidden="true"
                className="input-with-icon__icon"
              />
              <input
                className="input input-with-icon__input"
                placeholder="Name, City, Email, Phone…"
                value={p.q}
                onChange={(e) => p.setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") p.setQ("");
                }}
              />
            </div>
          </div>

          <div className="fl-filters__sort">
            <label className="block text-sm text-gray-600">Sortierung</label>
            <SortSelect value={p.sort} onChange={p.setSort} />
          </div>
        </div>

        {p.loading ? <div className="card">Loading…</div> : null}
        {p.err ? <div className="card text-red-600">{p.err}</div> : null}

        {!p.loading && !p.err ? (
          <>
            {p.superAdmin ? (
              <>
                <section className="news-admin__section">
                  {sectionHead(
                    viewLabelProvider("provider_pending"),
                    countLabel(p.provPendingAllCount, "provider_pending"),
                    true,
                  )}
                  <div className="news-admin__box--scroll3">
                    <PendingLocationsList
                      items={p.pagProvPending.items}
                      loading={false}
                      showChangeInfo={true}
                      onOpen={p.openInfo}
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
                    viewLabelProvider("provider_approved"),
                    countLabel(p.provApprovedAllCount, "provider_approved"),
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
                      onDeleteOne={deleteAdmin}
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
                    viewLabelProvider("provider_rejected"),
                    countLabel(p.provRejectedAllCount, "provider_rejected"),
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
                      onDeleteOne={deleteAdmin}
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
                    viewLabelMine("mine_approved"),
                    countLabel(p.mineApprovedAllCount, "mine_approved"),
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
                      onDeleteOne={deleteMine}
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
                    viewLabelMine("mine_pending"),
                    countLabel(p.minePendingAllCount, "mine_pending"),
                  )}
                  <div className="fl-admin__box fl-admin__box--scroll3">
                    <LocationsTableList
                      items={p.pagMinePending.items}
                      rowMode="mine_pending"
                      selectMode={p.minePendingSelectMode}
                      onToggleSelectMode={p.toggleMinePendingSelectMode}
                      busy={false}
                      onOpen={p.openEdit}
                      onDeleteOne={deleteMine}
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
                    viewLabelMine("mine_approved"),
                    countLabel(p.mineApprovedAllCount, "mine_approved"),
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
                      onDeleteOne={deleteMine}
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
                    viewLabelMine("mine_rejected"),
                    countLabel(p.mineRejectedAllCount, "mine_rejected"),
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
                      onDeleteOne={deleteMine}
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
        onDelete={
          p.edit?.id ? () => void p.removeMineOne(p.edit!.id) : undefined
        }
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
