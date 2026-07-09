import type { Translator } from "../types";

type Props = {
  busy: boolean;
  t: Translator;
};

export default function BookingsTableEmptyState({ busy, t }: Props) {
  return (
    <section className="card">
      <div className="card__empty">{getEmptyText(busy, t)}</div>
    </section>
  );
}

function getEmptyText(busy: boolean, t: Translator) {
  const key = busy ? "loading" : "empty";

  return t(`common.admin.onlineBookings.table.${key}`);
}
