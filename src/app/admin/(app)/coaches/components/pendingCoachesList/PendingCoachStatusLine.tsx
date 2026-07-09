import type { Coach } from "../../types";
import { pendingReviewLabel, providerLabel } from "../../utils";
import type { Translate } from "./types";

type Props = {
  c: Coach;
  t: Translate;
};

export default function PendingCoachStatusLine({ c, t }: Props) {
  return (
    <div className="pending-coaches__sub">
      <span>
        {t("common.admin.coaches.pending.by")}: {providerLabel(c)}
      </span>
      <span className="pending-coaches__sep">•</span>
      <span>
        {t("common.admin.coaches.pending.status")}: <b>{pendingReviewLabel(c, t)}</b>
      </span>
    </div>
  );
}
