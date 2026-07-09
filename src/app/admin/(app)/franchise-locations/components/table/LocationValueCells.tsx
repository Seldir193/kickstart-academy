import type { FranchiseLocation } from "../../types";
import { clean, fmtDate } from "../LocationsTableList.helpers";

export function LocationCountryCell({ item }: { item: FranchiseLocation }) {
  return (
    <div className="news-list__cell news-list__cell--cat">
      <span className="news-list__pill">{clean((item as any).country) || "—"}</span>
    </div>
  );
}

export function LocationCityCell({ item }: { item: FranchiseLocation }) {
  return <div className="news-list__cell news-list__cell--date">{clean((item as any).city) || "—"}</div>;
}

export function LocationUpdatedCell(props: { item: FranchiseLocation; lang?: string }) {
  return <div className="news-list__cell news-list__cell--author">{fmtDate((props.item as any).updatedAt, props.lang)}</div>;
}
