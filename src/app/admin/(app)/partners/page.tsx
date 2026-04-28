"use client";

import { useEffect, useMemo, useState } from "react";
import type { Partner } from "./types";
import PartnerDialog from "./components/PartnerDialog";
import PartnerList from "./components/PartnerList";
import PartnerPageHeader from "./components/PartnerPageHeader";
import DeletePartnerDialog from "./components/DeletePartnerDialog";
import PartnerFiltersBar from "./components/PartnerFiltersBar";
import { usePartnersPage } from "./usePartnersPage";
import {
  filterPartners,
  paginatePartners,
  sortFilteredPartners,
} from "./helpers";
import type { PartnerSortKey, PartnerStatusFilter } from "./helpers";

const PAGE_SIZE = 10;

export default function PartnersAdminPage() {
  const page = usePartnersPage();
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PartnerStatusFilter>("all");
  const [sort, setSort] = useState<PartnerSortKey>("newest");
  const [pageNumber, setPageNumber] = useState(1);

  const filteredItems = useMemo(
    () => filterPartners(page.sortedItems, query, status),
    [page.sortedItems, query, status],
  );

  const sortedItems = useMemo(
    () => sortFilteredPartners(filteredItems, sort),
    [filteredItems, sort],
  );

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));

  const pagedItems = useMemo(
    () => paginatePartners(sortedItems, pageNumber, PAGE_SIZE),
    [sortedItems, pageNumber],
  );

  useEffect(() => {
    setPageNumber((current) => Math.min(current, totalPages));
  }, [totalPages]);

  function closeDeleteDialog() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await page.remove(deleteTarget);
    closeDeleteDialog();
  }

  function updateQuery(value: string) {
    setQuery(value);
    setPageNumber(1);
  }

  function updateStatus(value: PartnerStatusFilter) {
    setStatus(value);
    setPageNumber(1);
  }

  function updateSort(value: PartnerSortKey) {
    setSort(value);
    setPageNumber(1);
  }

  function goPrev() {
    setPageNumber((current) => Math.max(1, current - 1));
  }

  function goNext() {
    setPageNumber((current) => Math.min(totalPages, current + 1));
  }

  return (
    <div className="news-admin ks partner-admin">
      <main className="container">
        <div className="partner-admin__toolbar">
          <PartnerFiltersBar
            query={query}
            status={status}
            sort={sort}
            onQueryChange={updateQuery}
            onStatusChange={updateStatus}
            onSortChange={updateSort}
          />

          <PartnerPageHeader busy={page.saving} onCreate={page.openCreate} />
        </div>

        {page.error ? (
          <div className="card" role="alert">
            <div className="text-red-600">{page.error}</div>
          </div>
        ) : null}

        <PartnerList
          loading={page.loading}
          busyItemId={page.busyItemId}
          items={pagedItems}
          total={sortedItems.length}
          page={pageNumber}
          totalPages={totalPages}
          onPrev={goPrev}
          onNext={goNext}
          onEdit={page.openEdit}
          onDelete={setDeleteTarget}
          onToggle={page.toggleActive}
        />
      </main>

      {page.dialogMode && page.dialogItem ? (
        <PartnerDialog
          mode={page.dialogMode}
          item={page.dialogItem}
          busy={page.saving}
          onClose={page.closeDialog}
          onSave={page.save}
          onUpload={page.uploadLogo}
        />
      ) : null}

      <DeletePartnerDialog
        open={Boolean(deleteTarget)}
        partnerName={deleteTarget?.name || ""}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
