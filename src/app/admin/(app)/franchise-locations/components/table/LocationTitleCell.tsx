import type { FranchiseLocation } from "../../types";
import { clean, fullName } from "../LocationsTableList.helpers";

type Props = {
  item: FranchiseLocation;
  showHint: boolean;
  hint: string;
};

function Hint({ show, hint }: { show: boolean; hint: string }) {
  if (!show || !hint) return null;
  return (
    <div className="news-list__draft-wrap">
      <span className="news-list__draft-label">{hint}</span>
    </div>
  );
}

export default function LocationTitleCell({ item, showHint, hint }: Props) {
  const addr = clean(item.address);
  return (
    <div className="news-list__cell news-list__cell--title">
      <div className="news-list__title">{fullName(item) || "—"}</div>
      <Hint show={showHint} hint={hint} />
      <div className={`news-list__excerpt ${addr ? "" : "is-empty"}`}>
        {addr || "—"}
      </div>
    </div>
  );
}
