import Link from "next/link";
import type { AdminHomeCounts } from "./types";

type Props = { counts: AdminHomeCounts; t: (key: string) => string };
type StatCard = { title: string; value: number; href: string; action: string };

export default function AdminHomeStatsGrid({ counts, t }: Props) {
  return <section className="grid">{statCards(counts, t).map((card) => <AdminHomeStatCard key={card.title} card={card} />)}</section>;
}

function AdminHomeStatCard({ card }: { card: StatCard }) {
  return <div className="card"><div className="card-head"><h3 className="card-title">{card.title}</h3></div><div className="text-xl font-bold">{card.value}</div><div className="card-actions"><Link href={card.href} className="btn">{card.action}</Link></div></div>;
}

function statCards(counts: AdminHomeCounts, t: (key: string) => string) {
  return [{ title: t("common.admin.home.cards.coursesOnline"), value: counts.onlineCount, href: "/trainings", action: t("common.admin.home.cards.allCourses") }, { title: t("common.admin.home.cards.places"), value: counts.placesCount, href: "/orte", action: t("common.admin.home.cards.managePlaces") }, { title: t("common.admin.home.cards.newsletterLeads"), value: counts.newsletterLeads, href: "/customers?tab=newsletter", action: t("common.admin.home.cards.viewLeads") }, { title: t("common.admin.home.cards.openRequests"), value: counts.openBookingsCount, href: "/admin/bookings", action: t("common.admin.home.cards.goToBookings") }];
}
