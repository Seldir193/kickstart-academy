import type { TFunction } from "i18next";

const KEYS = ["name", "position", "since", "status", "author", "action"];

type Props = { t: TFunction };

export default function CoachTableHeader({ t }: Props) {
  return <div className="coach-list__head" aria-hidden="true">{KEYS.map((key) => <HeaderCell key={key} name={key} t={t} />)}</div>;
}

function HeaderCell({ name, t }: { key?: string; name: string; t: TFunction }) {
  return <div className={name === "action" ? "coach-list__h coach-list__h--right" : "coach-list__h"}>{t(`common.admin.coaches.table.${name}`)}</div>;
}
