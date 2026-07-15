import type { StornoBookingsState, TFunc } from "../types";

type Props = { t: TFunc; bookings: StornoBookingsState };

export default function StornoStatusSection({ t, bookings }: Props) {
  if (!bookings.err && !bookings.loading) return null;
  return (
    <section className="dialog-section storno-dialog__statusSection">
      <div className="dialog-section__body">
        {bookings.err && (
          <div className="storno-dialog__error">{bookings.err}</div>
        )}
        {bookings.loading && (
          <div className="storno-dialog__note">
            {t("common.admin.customers.stornoDialog.loading")}
          </div>
        )}
      </div>
    </section>
  );
}
