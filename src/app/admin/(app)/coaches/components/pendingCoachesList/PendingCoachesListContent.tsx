"use client";

import { useTranslation } from "react-i18next";
import { cleanStr, getSlug } from "../../utils";
import PendingCoachesEmptyState from "./PendingCoachesEmptyState";
import PendingCoachRow from "./PendingCoachRow";
import type { PendingCoachesListProps } from "./types";

function coachKey(c: PendingCoachesListProps["items"][number]) {
  return cleanStr(getSlug(c));
}

export default function PendingCoachesListContent(props: PendingCoachesListProps) {
  const { t, i18n } = useTranslation();
  if (!props.items.length) return <PendingCoachesEmptyState text={t("common.admin.coaches.pending.empty")} />;

  return (
    <section className="card">
      <div className="card__body pending-coaches">
        {props.items.map((c) => <PendingCoachRow key={coachKey(c)} {...props} c={c} t={t} lang={i18n.language} />)}
      </div>
    </section>
  );
}
