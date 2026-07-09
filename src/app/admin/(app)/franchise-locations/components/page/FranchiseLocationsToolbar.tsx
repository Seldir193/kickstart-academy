import SortSelect from "../SortSelect";
import FranchiseLocationsSearch from "./FranchiseLocationsSearch";
import type { PageTextProps } from "./types";

function CreateButton({ p, t }: PageTextProps) {
  return (
    <button className="btn btn--primary" type="button" onClick={p.openCreate}>
      <img src="/icons/plus.svg" alt="" aria-hidden="true" className="btn__icon" />
      {t("common.admin.franchiseLocations.newLocation")}
    </button>
  );
}

export default function FranchiseLocationsToolbar({ p, t }: PageTextProps) {
  return <div className="fl-filters__row fl-filters__row--top"><FranchiseLocationsSearch p={p} t={t} /><div className="fl-filters__sort"><SortSelect value={p.sort} onChange={p.setSort} /></div><div className="fl-filters__action"><CreateButton p={p} t={t} /></div></div>;
}
