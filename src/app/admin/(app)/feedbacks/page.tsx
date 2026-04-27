"use client";

import FeedbackDialog from "./components/FeedbackDialog";
import FeedbackList from "./components/FeedbackList";
import FeedbackPageHeader from "./components/FeedbackPageHeader";
import { useFeedbacksPage } from "./useFeedbacksPage";

export default function FeedbacksAdminPage() {
  const page = useFeedbacksPage();

  return (
    <main className="container feedback-admin ks">
      <FeedbackPageHeader busy={page.busy} onCreate={page.openCreate} />

      {page.error ? (
        <div className="card" role="alert">
          <div className="text-red-600">{page.error}</div>
        </div>
      ) : null}

      <FeedbackList
        busy={page.busy}
        items={page.sortedItems}
        onEdit={page.openEdit}
        onDelete={page.remove}
        onToggle={page.toggleActive}
      />

      {page.dialogMode && page.dialogItem ? (
        <FeedbackDialog
          mode={page.dialogMode}
          item={page.dialogItem}
          busy={page.busy}
          onClose={page.closeDialog}
          onSave={page.save}
          onUpload={page.uploadImage}
        />
      ) : null}
    </main>
  );
}