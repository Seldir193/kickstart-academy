"use client";

import { useTranslation } from "react-i18next";
import AdminNotice from "../../../shared/components/AdminNotice";
import OnlineBookingDialogMount from "./OnlineBookingDialogMount";
import OnlineBookingsListSection from "./OnlineBookingsListSection";
import OnlineBookingsToolbar from "./OnlineBookingsToolbar";
import { useOnlineBookingsPageState } from "./useOnlineBookingsPageState";

export default function OnlineBookingsPageContent() {
  const page = useOnlineBookingsPageState();
  const { t } = useTranslation();
  return <OnlineBookingsPageView page={page} t={t} />;
}

function OnlineBookingsPageView({ page, t }: { page: ReturnType<typeof useOnlineBookingsPageState>; t: (key: string) => string }) {
  return <div className="news-admin ks online-bookings-admin"><AdminNotice notice={page.notice} /><main className="container"><OnlineBookingsToolbar {...page} t={t} total={page.list.total} totalAll={page.list.totalAll} counts={page.list.counts} /><ErrorCard error={page.list.error} /><OnlineBookingsListSection t={t} total={page.list.total} items={page.itemsSorted} page={page.page} pages={page.list.pages} mutating={page.mutating} selectMode={page.selectMode} toggleBtnRef={page.toggleBtnRef} setPage={page.setPage} setSelectMode={page.setSelectMode} setSel={page.setSel} onDeleteMany={page.onDeleteMany} onRestoreMany={page.onRestoreMany} /></main><OnlineBookingDialogMount booking={page.sel} setSel={page.setSel} reload={page.list.reload} showOk={page.showOk} onConfirm={page.onConfirm} onSetStatus={page.onSetStatus} onDeleteOne={page.onDeleteOne} onCancelConfirmed={page.onCancelConfirmed} onApprovePayment={page.onApprovePayment} /></div>;
}

function ErrorCard({ error }: { error: string | null }) {
  if (!error) return null;
  return <div className="card" role="alert"><div className="text-red-600">{error}</div></div>;
}
