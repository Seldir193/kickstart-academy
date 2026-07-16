"use client";

import { useTranslation } from "react-i18next";
import AdminNotice from "../../../shared/components/AdminNotice";
import VoucherDialog from "../VoucherDialog";
import VouchersListSection from "./VouchersListSection";
import VouchersToolbar from "./VouchersToolbar";
import { useVouchersPageState } from "./useVouchersPageState";

type PageState = ReturnType<typeof useVouchersPageState>;
type Translate = (key: string) => string;

export default function VouchersPageContent() {
  const page = useVouchersPageState();
  const { t } = useTranslation();
  return <VouchersPageView page={page} t={t} />;
}

function VouchersPageView({ page, t }: { page: PageState; t: Translate }) {
  return (
    <div className="news-admin ks vouchers-admin">
      <AdminNotice notice={page.notice} />
      <main className="container">
        <VouchersToolbar {...page} t={t} total={page.list.items.length} />
        <ErrorCard error={page.list.error} />
        <VouchersListSection {...listProps(page, t)} />
      </main>
      <VoucherDialog {...dialogProps(page)} />
    </div>
  );
}

function ErrorCard({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="card" role="alert">
      <div className="text-red-600">{error}</div>
    </div>
  );
}

function listProps(page: PageState, t: Translate) {
  return {
    t,
    ...listData(page),
    ...listHandlers(page),
  };
}

function listData(page: PageState) {
  return {
    items: page.pagedItems,
    total: page.list.items.length,
    pages: page.pages,
    pageSafe: page.pageSafe,
    busy: page.busy,
    loading: page.list.loading,
    selectMode: page.selectMode,
    toggleBtnRef: page.toggleBtnRef,
  };
}

function listHandlers(page: PageState) {
  return {
    setPage: page.setPage,
    setSelectMode: page.setSelectMode,
    onOpen: page.openEditDialog,
    onDeleteMany: page.handleDeleteMany,
    onActivateMany: page.handleActivateMany,
    onDeactivateMany: page.handleDeactivateMany,
  };
}

function dialogProps(page: PageState) {
  return {
    voucher: page.sel,
    open: page.dialogOpen,
    busy: page.busy,
    onClose: page.closeDialogs,
    onCreate: page.handleCreate,
    onUpdate: page.handleUpdate,
    onDelete: page.handleDelete,
  };
}
