import type { FranchiseLocation } from "../../types";
import type { StatusParts } from "../LocationsTableList.helpers";
import LocationStatusMain from "./LocationStatusMain";
import LocationStatusSwitch from "./LocationStatusSwitch";
import type { LocationToggleHandler } from "./types";

type Props = {
  item: FranchiseLocation;
  status: StatusParts;
  showSwitch: boolean;
  published: boolean;
  switchDisabled: boolean;
  switchBusy: boolean;
  onTogglePublished?: LocationToggleHandler;
};

export default function LocationStatusCell(p: Props) {
  return (
    <div className="news-list__cell news-list__cell--status">
      <div className="coach-statusline">
        <LocationStatusMain item={p.item} status={p.status} />
        <LocationStatusSwitch {...p} item={p.item} show={p.showSwitch} disabled={p.switchDisabled} busy={p.switchBusy} />
      </div>
    </div>
  );
}
