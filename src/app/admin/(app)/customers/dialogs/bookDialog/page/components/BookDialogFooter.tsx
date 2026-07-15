import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogFooter({ controller }: Props) {
  return (
    <div className="dialog-footer book-dialog__footer">
      <div className="book-dialog__footerActions">
        <button
          className="btn book-dialog__confirmBtn"
          disabled={
            controller.submit.saving ||
            !controller.offers.selectedOfferId ||
            !controller.offers.selectedDate
          }
          onClick={controller.submit.submit}
        >
          {controller.submit.saving
            ? controller.t("common.admin.customers.bookDialog.booking")
            : controller.t("common.admin.customers.bookDialog.confirmBooking")}
        </button>
      </div>
    </div>
  );
}
