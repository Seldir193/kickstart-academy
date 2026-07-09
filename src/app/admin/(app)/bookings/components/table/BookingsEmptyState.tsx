import type { TFn } from "./types";

export function BookingsEmptyState({ t }: { t: TFn }) {
  return (
    <section className="card">
      <div className="card__empty">
        {t("common.admin.bookings.table.empty")}
      </div>
    </section>
  );
}
