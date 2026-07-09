import type { Translator } from "../types";

type Props = {
  t: Translator;
};

export default function BookingsTableHead({ t }: Props) {
  return (
    <div className="news-list__head" aria-hidden="true">
      {headKeys().map((key) => renderHeadCell(t, key))}
      <div className="news-list__h news-list__h--right">{headLabel(t, "action")}</div>
    </div>
  );
}

function headKeys() {
  return ["name", "email", "age", "date", "program", "status", "payment", "created"];
}

function renderHeadCell(t: Translator, key: string) {
  return (
    <div key={key} className="news-list__h">
      {getHeadText(t, key)}
    </div>
  );
}

function getHeadText(t: Translator, key: string) {
  if (key !== "date") return headLabel(t, key);
  return `${headLabel(t, "date")}${headLabel(t, "date")}`;
}

function headLabel(t: Translator, key: string) {
  return t(`common.admin.onlineBookings.table.head.${key}`);
}
