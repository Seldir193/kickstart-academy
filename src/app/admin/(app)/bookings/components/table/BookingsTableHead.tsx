import type { TFn } from "./types";

const HEAD_KEYS = [
  "name",
  "email",
  "age",
  "date",
  "program",
  "status",
  "payment",
  "created",
] as const;

export function BookingsTableHead({ t }: { t: TFn }) {
  return (
    <div className="news-list__head" aria-hidden="true">
      {HEAD_KEYS.map((key) => headCell(t, key))}
      {actionHeadCell(t)}
    </div>
  );
}

function headCell(t: TFn, key: string) {
  return <div key={key} className="news-list__h">{label(t, key)}</div>;
}

function actionHeadCell(t: TFn) {
  return <div className="news-list__h news-list__h--right">{label(t, "action")}</div>;
}

function label(t: TFn, key: string) {
  return t(`common.admin.bookings.table.head.${key}`);
}
