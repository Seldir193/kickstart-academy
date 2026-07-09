import type { TFunction } from "i18next";
import type { Coach } from "../../types";
import CoachPublishedSwitch from "./CoachPublishedSwitch";
import { statusLabel } from "./coachTableDisplay";
import type { CoachRowMeta } from "./types";

type Props = {
  meta: CoachRowMeta;
  t: TFunction;
  authorDash?: boolean;
  onTogglePublished?: (c: Coach, nextPublished: boolean) => void | Promise<void>;
};

export default function CoachStatusCell(props: Props) {
  return <div className="coach-list__cell coach-list__cell--status"><div className="coach-statusline"><StatusBadge {...props} /><CoachPublishedSwitch {...props} /></div></div>;
}

function StatusBadge({ meta, t, authorDash }: Props) {
  return <span className={`coach-list__status ${meta.statusClass}`}><span className="coach-list__status-main">{statusLabel(meta.raw, t, authorDash)}</span><StatusSubline meta={meta} t={t} /></span>;
}

function StatusSubline({ meta, t }: Pick<Props, "meta" | "t">) {
  if (!meta.approved) return null;
  return <span className="coach-list__status-sub">{meta.published ? t("common.admin.coaches.table.online") : t("common.admin.coaches.table.offline")}</span>;
}
