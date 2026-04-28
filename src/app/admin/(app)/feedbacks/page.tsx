"use client";

import { useEffect, useMemo, useState } from "react";
import type { Feedback } from "./types";
import FeedbackDialog from "./components/FeedbackDialog";
import FeedbackList from "./components/FeedbackList";
import FeedbackPageHeader from "./components/FeedbackPageHeader";
import DeleteFeedbackDialog from "./components/DeleteFeedbackDialog";
import FeedbackFiltersBar from "./components/FeedbackFiltersBar";
import { useFeedbacksPage } from "./useFeedbacksPage";
import {
  filterFeedbacks,
  paginateFeedbacks,
  sortFilteredFeedbacks,
} from "./helpers";
import type { FeedbackCategoryFilter, FeedbackSortKey } from "./helpers";

const PAGE_SIZE = 10;

export default function FeedbacksAdminPage() {
  const page = useFeedbacksPage();
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FeedbackCategoryFilter>("all");
  const [sort, setSort] = useState<FeedbackSortKey>("newest");
  const [pageNumber, setPageNumber] = useState(1);

  const filteredItems = useMemo(
    () => filterFeedbacks(page.sortedItems, query, category),
    [page.sortedItems, query, category],
  );

  const sortedItems = useMemo(
    () => sortFilteredFeedbacks(filteredItems, sort),
    [filteredItems, sort],
  );

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));

  const pagedItems = useMemo(
    () => paginateFeedbacks(sortedItems, pageNumber, PAGE_SIZE),
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

  function updateCategory(value: FeedbackCategoryFilter) {
    setCategory(value);
    setPageNumber(1);
  }

  function updateSort(value: FeedbackSortKey) {
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
    <div className="news-admin ks feedback-admin">
      <main className="container">
        <div className="feedback-admin__toolbar">
          <FeedbackFiltersBar
            query={query}
            category={category}
            sort={sort}
            onQueryChange={updateQuery}
            onCategoryChange={updateCategory}
            onSortChange={updateSort}
          />

          <FeedbackPageHeader busy={page.saving} onCreate={page.openCreate} />
        </div>

        {page.error ? (
          <div className="card" role="alert">
            <div className="text-red-600">{page.error}</div>
          </div>
        ) : null}

        <FeedbackList
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
          onBulkDelete={page.removeMany}
          onBulkDeactivate={page.deactivateMany}
        />
      </main>

      {page.dialogMode && page.dialogItem ? (
        <FeedbackDialog
          mode={page.dialogMode}
          item={page.dialogItem}
          busy={page.saving}
          onClose={page.closeDialog}
          onSave={page.save}
          onUpload={page.uploadImage}
        />
      ) : null}

      <DeleteFeedbackDialog
        open={Boolean(deleteTarget)}
        feedbackName={deleteTarget?.author || ""}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
