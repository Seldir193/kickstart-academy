"use client";

import { useTranslation } from "react-i18next";
import AdminNotice from "../../../shared/components/AdminNotice";
import VoucherDialog from "../VoucherDialog";
import VouchersListSection from "./VouchersListSection";
import VouchersToolbar from "./VouchersToolbar";
import { useVouchersPageState } from "./useVouchersPageState";

export default function VouchersPageContent() {
  const page = useVouchersPageState();
  const { t } = useTranslation();
  return <VouchersPageView page={page} t={t} />;
}

function VouchersPageView({ page, t }: { page: ReturnType<typeof useVouchersPageState>; t: (key: string) => string }) {
  return <div className="news-admin ks vouchers-admin"><AdminNotice notice={page.notice} /><main className="container"><VouchersToolbar {...page} t={t} total={page.list.items.length} /><ErrorCard error={page.list.error} /><VouchersListSection t={t} items={page.pagedItems} total={page.list.items.length} pages={page.pages} pageSafe={page.pageSafe} busy={page.busy} loading={page.list.loading} selectMode={page.selectMode} toggleBtnRef={page.toggleBtnRef} setPage={page.setPage} setSelectMode={page.setSelectMode} onOpen={page.openEditDialog} onDeleteMany={page.handleDeleteMany} onActivateMany={page.handleActivateMany} onDeactivateMany={page.handleDeactivateMany} /></main><VoucherDialog voucher={page.sel} open={page.dialogOpen} busy={page.busy} onClose={page.closeDialogs} onCreate={page.handleCreate} onUpdate={page.handleUpdate} onDelete={page.handleDelete} /></div>;
}

function ErrorCard({ error }: { error: string | null }) {
  if (!error) return null;
  return <div className="card" role="alert"><div className="text-red-600">{error}</div></div>;
}
