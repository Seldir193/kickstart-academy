import type { Coach } from "../../types";
import PendingCoachActions from "./PendingCoachActions";
import PendingCoachMeta from "./PendingCoachMeta";
import { isRowBusy } from "./pendingCoachText";
import type { PendingCoachesListProps, Translate } from "./types";

type Props = Omit<PendingCoachesListProps, "items"> & {
  c: Coach;
  t: Translate;
  lang?: string;
};

export default function PendingCoachRow(p: Props) {
  const rowBusy = isRowBusy(p.busy, p.busySlug, p.c);

  return (
    <div className="pending-coaches__row">
      <PendingCoachMeta c={p.c} t={p.t} lang={p.lang} />
      <PendingCoachActions {...p} disabled={rowBusy} />
    </div>
  );
}
