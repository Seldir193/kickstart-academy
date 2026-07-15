import AdminHomeRecentRow from "./AdminHomeRecentRow";
import AdminHomeRecentTableHead from "./AdminHomeRecentTableHead";
import type { Offer } from "./types";

type Props = {
  items: Offer[];
  page: number;
  language: string;
  t: (key: string) => string;
  onNavigate: (href: string) => void;
};

export default function AdminHomeRecentTable(props: Props) {
  return (
    <div className="news-list__table">
      <AdminHomeRecentTableHead t={props.t} />
      <ul className="list list--bleed">{recentRows(props)}</ul>
    </div>
  );
}

function recentRows(props: Props) {
  return props.items.map((offer, index) => (
    <AdminHomeRecentRow
      key={offer._id}
      offer={offer}
      index={index}
      page={props.page}
      language={props.language}
      t={props.t}
      onNavigate={props.onNavigate}
    />
  ));
}
