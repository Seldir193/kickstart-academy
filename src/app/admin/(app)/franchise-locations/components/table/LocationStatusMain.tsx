import type { FranchiseLocation } from "../../types";
import { statusClass, type StatusParts } from "../LocationsTableList.helpers";

type Props = {
  item: FranchiseLocation;
  status: StatusParts;
};

export default function LocationStatusMain({ item, status }: Props) {
  return (
    <span className={`news-list__status ${statusClass(item)}`}>
      <span className="news-list__status-main">{status.main}</span>
      {status.sub ? <span className="news-list__status-sub">{status.sub}</span> : null}
    </span>
  );
}
