"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AdminHomeHero from "./AdminHomeHero";
import AdminHomePager from "./AdminHomePager";
import AdminHomeRecentSection from "./AdminHomeRecentSection";
import AdminHomeStatsGrid from "./AdminHomeStatsGrid";
import { useAdminHomePageState } from "./useAdminHomePageState";

export default function AdminHomePageContent() {
  const page = useAdminHomePageState();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  return <div className="ks admin-home"><main className="container"><AdminHomeHero adminName={page.adminName} t={t} onQuickOpen={() => page.setQuickOpen(true)} /><AdminHomeStatsGrid counts={page.counts} t={t} /><AdminHomeRecentSection items={page.recent.items} loadingList={page.recent.loadingList} page={page.page} language={i18n.language} t={t} onNavigate={(href) => router.push(href)} /></main><AdminHomePager page={page.page} pageCount={page.recent.pageCount} setPage={page.setPage} t={t} />{page.quickOpen ? null : null}</div>;
}
