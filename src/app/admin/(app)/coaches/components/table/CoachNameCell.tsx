import type { TFunction } from "i18next";
import type { Coach } from "../../types";
import { cleanStr, fullName, getSlug } from "../../utils";

type Props = { coach: Coach; t: TFunction };

export default function CoachNameCell({ coach, t }: Props) {
  return <div className="coach-list__cell coach-list__cell--name"><CoachTitle coach={coach} /><CoachSlug coach={coach} t={t} /></div>;
}

function CoachTitle({ coach }: { coach: Coach }) {
  return <div className="coach-list__title">{fullName(coach)}</div>;
}

function CoachSlug({ coach, t }: Props) {
  const slug = cleanStr(getSlug(coach));
  return <div className={`coach-list__excerpt ${slug ? "" : "is-empty"}`}>{slug || t("common.admin.coaches.table.emptyValue")}</div>;
}
