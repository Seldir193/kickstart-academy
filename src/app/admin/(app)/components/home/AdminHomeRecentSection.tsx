import AdminHomeRecentHeader from "./AdminHomeRecentHeader";
import AdminHomeRecentTable from "./AdminHomeRecentTable";
import type { Offer } from "./types";

type Props = { items: Offer[]; loadingList: boolean; page: number; language: string; t: (key: string) => string; onNavigate: (href: string) => void };

export default function AdminHomeRecentSection(props: Props) {
  return <section className="card news-list admin-home__recent"><AdminHomeRecentHeader t={props.t} /><RecentBody {...props} /></section>;
}

function RecentBody(props: Props) {
  if (props.loadingList) return <RecentEmpty label={props.t("common.admin.home.recent.loading")} />;
  if (props.items.length === 0) return <RecentEmpty label={props.t("common.admin.home.recent.empty")} />;
  return <AdminHomeRecentTable {...props} />;
}

function RecentEmpty({ label }: { label: string }) {
  return <div className="card__empty">{label}</div>;
}
