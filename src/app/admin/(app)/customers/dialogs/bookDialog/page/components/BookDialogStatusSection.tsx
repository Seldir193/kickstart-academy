import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogStatusSection({ controller }: Props) {
  if (!controller.offers.err && !controller.offers.loadingOffers) return null;
  return (
    <section className="dialog-section book-dialog__statusSection">
      <div className="dialog-section__body">
        {controller.offers.err && (
          <div className="book-dialog__error">{controller.offers.err}</div>
        )}
        {controller.offers.loadingOffers && (
          <div className="book-dialog__note">
            {controller.t("common.admin.customers.bookDialog.loadingOffers")}
          </div>
        )}
      </div>
    </section>
  );
}
