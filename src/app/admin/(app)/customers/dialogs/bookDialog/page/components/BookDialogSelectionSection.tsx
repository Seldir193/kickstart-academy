import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import BookDialogCourseSelect from "../../../components/BookDialogCourseSelect";
import BookDialogOfferSelect from "../../../components/BookDialogOfferSelect";
import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogSelectionSection({ controller }: Props) {
  return (
    <section className="dialog-section book-dialog__selectionSection">
      <SelectionHead controller={controller} />
      <div className="dialog-section__body book-dialog__selectionBody">
        <CourseField controller={controller} />
        <OfferField controller={controller} />
        <DateField controller={controller} />
      </div>
    </section>
  );
}

function SelectionHead({ controller }: Props) {
  return (
    <div className="dialog-section__head">
      <h4 className="dialog-section__title">
        {controller.t("common.admin.customers.bookDialog.offerSelection")}
      </h4>
    </div>
  );
}

function CourseField({ controller }: Props) {
  return (
    <div className="book-dialog__field">
      <label className="dialog-label">
        {controller.t("common.admin.customers.bookDialog.courses")}
      </label>
      <BookDialogCourseSelect
        courseValue={controller.offers.courseValue}
        setCourseValue={controller.offers.setCourseValue}
        selectedCourseLabel={controller.offers.selectedCourseLabel}
        isOpen={controller.dropdowns.isCourseDropdownOpen}
        setIsOpen={controller.dropdowns.setIsCourseDropdownOpen}
        dropdownRef={controller.dropdowns.courseDropdownRef}
      />
    </div>
  );
}

function OfferField({ controller }: Props) {
  return (
    <div className="book-dialog__field">
      <label className="dialog-label">
        {controller.t("common.admin.customers.bookDialog.offer")}
      </label>
      <BookDialogOfferSelect
        filteredOffers={controller.offers.filteredOffers}
        selectedOfferId={controller.offers.selectedOfferId}
        setSelectedOfferId={controller.offers.setSelectedOfferId}
        selectedOfferLabel={controller.offers.selectedOfferLabel}
        isOpen={controller.dropdowns.isOfferDropdownOpen}
        setIsOpen={controller.dropdowns.setIsOfferDropdownOpen}
        dropdownRef={controller.dropdowns.offerDropdownRef}
      />
      {!controller.offers.filteredOffers.length && (
        <div className="book-dialog__note mt-1">
          {controller.t(
            "common.admin.customers.bookDialog.noOffersInSelection",
          )}
        </div>
      )}
    </div>
  );
}

function DateField({ controller }: Props) {
  return (
    <div className="book-dialog__field">
      <label className="dialog-label">
        {controller.t("common.admin.customers.bookDialog.startDate")}
      </label>
      <KsDatePicker
        value={controller.offers.selectedDate}
        onChange={(nextIso) => controller.offers.setSelectedDate(nextIso)}
        placeholder={controller.t("common.placeholders.date")}
        disabled={false}
      />
    </div>
  );
}
