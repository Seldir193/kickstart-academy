import type { CancelBookingsState, TFunc } from "../types";

export default function CancelStatusSection({
  t,
  bookings,
}: {
  t: TFunc;
  bookings: CancelBookingsState;
}) {
  if (!bookings.err && !bookings.loadingOffers) return null;
  return (
    <section className="dialog-section cancel-dialog__statusSection">
      <div className="dialog-section__body">
        {bookings.err && (
          <div className="cancel-dialog__error">{bookings.err}</div>
        )}
        {bookings.loadingOffers && <LoadingCourses t={t} />}
      </div>
    </section>
  );
}

function LoadingCourses({ t }: { t: TFunc }) {
  return (
    <div className="cancel-dialog__note">
      {t("common.admin.customers.cancelDialog.loadingCourses")}
    </div>
  );
}
