// src/app/admin/(app)/invoices/page.tsx
"use client";

import React, { useCallback, useMemo } from "react";
import { fmtDate } from "./utils/invoiceList";
import { sortLabel } from "./utils/invoiceUi";
import { useFixedSelectbox } from "@/app/admin/(app)/customers/hooks/useFixedSelectbox";
import InvoicesFilters from "./components/InvoicesFilters";
import InvoicesTopSelects from "./components/InvoicesTopSelects";
import InvoicesList from "./components/InvoicesList";
import InvoicesBottomBar from "./components/InvoicesBottomBar";
import InvoicesPager from "./components/InvoicesPager";
import InvoiceDunningDialog from "./components/InvoiceDunningDialog";
import InvoicePaymentDunningFilters from "./components/InvoicePaymentDunningFilters";
import SortOverlay from "./components/invoices-top-selects/SortOverlay";
import { toggleOpen } from "./components/invoices-top-selects/topSelectsUi";
import { useSelectboxScrollClose } from "./hooks/useSelectboxScrollClose";
import { useInvoiceRowActions } from "./hooks/useInvoiceRowActions";
import { useInvoicesLoader } from "./hooks/useInvoicesLoader";
import { useInvoicesPageState } from "./hooks/useInvoicesPageState";
import { useInvoicesPageDerived } from "./hooks/useInvoicesPageDerived";

const basePath = "/api/admin/invoices";

function qs(params: Record<string, string>) {
  const sp = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const v = String(value || "").trim();
    if (v) sp.set(key, v);
  });

  return sp.toString();
}

export default function AdminInvoicesPage() {
  const s = useInvoicesPageState();

  const docsSelect = useFixedSelectbox();
  const perPageSelect = useFixedSelectbox();
  const sortSelect = useFixedSelectbox();

  useSelectboxScrollClose(docsSelect, perPageSelect, sortSelect);

  const loader = useInvoicesLoader({
    basePath,
    invoiceQuery: s.invoiceQuery,
    q: s.q,
    from: s.from,
    to: s.to,
    dunningFilter: s.dunningFilter,
    sort: s.sort,
  });

  // const derived = useInvoicesPageDerived({
  //   items: loader.items,
  //   paymentFilter: s.paymentFilter,
  //   dunningFilter: s.dunningFilter,
  //   types: {
  //     typeParticipation: s.typeParticipation,
  //     typeInvoice: s.typeInvoice,
  //     typeCancellation: s.typeCancellation,
  //     typeStorno: s.typeStorno,
  //     typeDunning: s.typeDunning,
  //     typeCreditNote: s.typeCreditNote,
  //   },
  //   page: s.page,
  //   limit: s.limit,
  //   setPage: s.setPage,
  // });

  const derived = useInvoicesPageDerived({
    items: loader.items,
    total: loader.total,
    paymentFilter: s.paymentFilter,
    dunningFilter: s.dunningFilter,
    types: {
      typeParticipation: s.typeParticipation,
      typeInvoice: s.typeInvoice,
      typeCancellation: s.typeCancellation,
      typeStorno: s.typeStorno,
      typeDunning: s.typeDunning,
      typeCreditNote: s.typeCreditNote,
    },
    page: s.page,
    limit: s.limit,
    setPage: s.setPage,
  });

  const visibleDocIds = useMemo(() => {
    return derived.pagedItems
      .map((item) => String(item?.id || "").trim())
      .filter(Boolean);
  }, [derived.pagedItems]);

  const csvHref = useMemo(() => {
    const idsQuery = qs({ ids: visibleDocIds.join(",") });
    const fullQuery = [s.downloadQuery, idsQuery].filter(Boolean).join("&");
    return `/api/admin/invoices/csv?${fullQuery}`;
  }, [s.downloadQuery, visibleDocIds]);

  const zipHref = useMemo(() => {
    const idsQuery = qs({ ids: visibleDocIds.join(",") });
    const fullQuery = [s.downloadQuery, idsQuery].filter(Boolean).join("&");
    return `/api/admin/invoices/zip?${fullQuery}`;
  }, [s.downloadQuery, visibleDocIds]);

  const reloadInvoices = useCallback(async () => {
    await loader.reload();
  }, [loader.reload]);

  const actions = useInvoiceRowActions(reloadInvoices);

  function resetPage() {
    s.setPage(1);
  }

  return (
    <div className="ks invoices admin-scope p-4 max-w-6xl mx-auto">
      <section className="card ks-invoices__card">
        <InvoicesFilters
          typeParticipation={s.typeParticipation}
          typeCancellation={s.typeCancellation}
          typeStorno={s.typeStorno}
          typeDunning={s.typeDunning}
          typeCreditNote={s.typeCreditNote}
          typeInvoice={s.typeInvoice}
          setTypeInvoice={s.setTypeInvoice}
          setTypeParticipation={s.setTypeParticipation}
          setTypeCancellation={s.setTypeCancellation}
          setTypeStorno={s.setTypeStorno}
          setTypeDunning={s.setTypeDunning}
          setTypeCreditNote={s.setTypeCreditNote}
          q={s.q}
          setQ={s.setQ}
          from={s.from}
          setFrom={s.setFrom}
          to={s.to}
          setTo={s.setTo}
          onAnyChangeResetPage={resetPage}
        >
          <div
            className={
              "ks-selectbox ks-invoices__toolbarSelect ks-invoices__toolbarSelect--sort" +
              (sortSelect.open ? " ks-selectbox--open" : "")
            }
          >
            <button
              ref={sortSelect.triggerRef}
              type="button"
              className="ks-selectbox__trigger input ks-invoices__selectTrigger"
              onClick={() =>
                toggleOpen(
                  sortSelect.open,
                  sortSelect.setOpen,
                  sortSelect.openMenu,
                )
              }
              aria-haspopup="listbox"
              aria-expanded={sortSelect.open}
            >
              <span className="ks-selectbox__label">
                {sortLabel(s.sortOrder)}
              </span>
              <span className="ks-selectbox__chevron" aria-hidden="true" />
            </button>
          </div>

          <InvoicePaymentDunningFilters
            payment={s.paymentFilter}
            dunning={s.dunningFilter}
            onPaymentChange={s.setPaymentFilter}
            onDunningChange={s.setDunningFilter}
            disabled={false}
          />
        </InvoicesFilters>

        <SortOverlay
          sortSelect={sortSelect}
          sortOrder={s.sortOrder}
          setSortOrder={s.setSortOrder}
          resetPage={resetPage}
        />

        <div className="ks-invoices__docsRow">
          <InvoicesTopSelects
            loading={loader.loading && !loader.hasLoadedOnce}
            items={derived.pagedItems}
            docsSelect={docsSelect}
            sortSelect={sortSelect}
            sortOrder={s.sortOrder}
            setSortOrder={s.setSortOrder}
            resetPage={resetPage}
            openPdf={derived.openPdf}
            fmtDate={fmtDate}
          />
        </div>

        <InvoicesList
          loading={loader.loading && !loader.hasLoadedOnce}
          items={derived.pagedItems}
          openPdf={derived.openPdf}
          fmtDate={fmtDate}
          rowBusyId={actions.rowBusyId}
          onMarkPaid={actions.handleMarkPaid}
          onOpenReturned={actions.openReturnedDialog}
          onOpenDunning={actions.openDunningDialog}
          onQuickSendDoc={actions.handleQuickSendDoc}
          onVoidDunning={actions.handleVoidDunning}
          onMarkCollection={actions.handleMarkCollection}
          onOpenRefund={actions.openRefundDialog}
          onOpenWithdraw={actions.openWithdrawDialog}
        />

        <InvoicesBottomBar
          csvHref={csvHref}
          zipHref={zipHref}
          limit={s.limit}
          setLimit={s.setLimit}
          resetPage={resetPage}
          perPageSelect={perPageSelect}
          err={loader.err}
        />
      </section>

      <InvoicesPager
        page={s.page}
        totalPages={derived.totalPages}
        setPage={s.setPage}
      />

      <InvoiceDunningDialog
        state={actions.actionState}
        setState={actions.setActionState}
        onClose={actions.closeActionDialog}
        onSubmitReturned={actions.submitReturnedDialog}
        onSubmitDunning={actions.submitDunningDialog}
        onSubmitRefund={actions.submitRefundDialog}
        onSubmitWithdraw={actions.submitWithdrawDialog}
      />
    </div>
  );
}
