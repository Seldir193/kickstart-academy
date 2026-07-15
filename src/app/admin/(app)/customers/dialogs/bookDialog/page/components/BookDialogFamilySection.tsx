import BookDialogFamilyBox from "../../../components/BookDialogFamilyBox";
import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogFamilySection({ controller }: Props) {
  return (
    <section className="dialog-section book-dialog__familySection">
      <SectionHead controller={controller} />
      <div className="dialog-section__body">
        <BookDialogFamilyBox {...familyProps(controller)} />
      </div>
    </section>
  );
}

function SectionHead({ controller }: Props) {
  return (
    <div className="dialog-section__head">
      <h4 className="dialog-section__title">
        {controller.t("common.admin.customers.bookDialog.bookingScope")}
      </h4>
    </div>
  );
}

function familyProps(controller: BookDialogController) {
  const { family, dropdowns } = controller;
  return {
    family: family.family,
    familyLoading: family.familyLoading,
    familyError: family.familyError,
    selectedParent: family.selectedParent,
    selectedParentId: family.selfMemberId,
    selectedParentLabel: family.selectedParentLabel,
    parentOptions: family.parentOptions,
    activeChild: family.activeChild,
    bookingTarget: family.bookingTarget,
    setBookingTarget: family.setBookingTarget,
    parentOpen: dropdowns.isParentDropdownOpen,
    setParentOpen: dropdowns.setIsParentDropdownOpen,
    childOpen: dropdowns.isChildDropdownOpen,
    setChildOpen: dropdowns.setIsChildDropdownOpen,
    setSelectedParentId: family.setSelectedParentId,
    selectedChildUid: family.selectedChildUid,
    setSelectedChildUid: family.setSelectedChildUid,
    childOptions: family.childOptions,
    parentDropdownRef: dropdowns.parentDropdownRef,
    childDropdownRef: dropdowns.childDropdownRef,
  };
}
