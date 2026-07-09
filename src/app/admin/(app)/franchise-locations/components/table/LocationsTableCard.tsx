import LocationsRows from "./LocationsRows";
import LocationsTableHead from "./LocationsTableHead";
import type { LocationsTableListProps, SelectionState } from "./types";

type Props = LocationsTableListProps & {
  selection: SelectionState;
  showSwitch: boolean;
  t: (key: string) => string;
  lang?: string;
};

export default function LocationsTableCard(p: Props) {
  return (
    <section className={`card news-list ${p.busy ? "is-busy" : ""}`}>
      <div className="news-list__table">
        <LocationsTableHead t={p.t} />
        <LocationsRows {...p} />
      </div>
    </section>
  );
}
