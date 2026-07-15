import type { FranchiseLocation } from "../../types";
import { clean, fmtDate } from "../LocationsTableList.helpers";

export function LocationCountryCell({ item }: { item: FranchiseLocation }) {
  return (
    <div className="news-list__cell news-list__cell--cat">
      <span className="news-list__pill">{clean(item.country) || "—"}</span>
    </div>
  );
}

export function LocationCityCell({ item }: { item: FranchiseLocation }) {
  return (
    <div className="news-list__cell news-list__cell--date">
      {clean(item.city) || "—"}
    </div>
  );
}

export function LocationUpdatedCell(props: {
  item: FranchiseLocation;
  lang?: string;
}) {
  return (
    <div className="news-list__cell news-list__cell--author">
      {fmtDate(props.item.updatedAt, props.lang)}
    </div>
  );
}
