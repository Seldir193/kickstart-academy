import type { TFunction } from "i18next";

type Props = { t: TFunction };

export default function CoachTableEmpty({ t }: Props) {
  return <section className="card"><div className="card__empty">{t("common.admin.coaches.table.empty")}</div></section>;
}
