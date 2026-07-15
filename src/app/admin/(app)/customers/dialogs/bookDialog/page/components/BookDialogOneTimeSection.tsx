import BookDialogBookingFields from "./BookDialogBookingFields";
import {
  BookingDetailsTitle,
  CampCard,
  DetailsSection,
} from "./BookDialogDetailsLayout";
import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogOneTimeSection({ controller }: Props) {
  if (!controller.offers.isOneTimeVoucherOffer) return null;
  return (
    <DetailsSection
      title={controller.t("common.admin.customers.bookDialog.bookingDetails")}
    >
      <CampCard
        eyebrow={controller.t(
          "common.admin.customers.bookDialog.oneTimeBooking",
        )}
        title={controller.t("common.admin.customers.bookDialog.bookingDetails")}
      >
        <FooterBlock controller={controller} />
      </CampCard>
    </DetailsSection>
  );
}

function FooterBlock({ controller }: Props) {
  return (
    <div className="camp-block camp-block--footer">
      <BookingDetailsTitle t={controller.t} />
      <BookDialogBookingFields controller={controller} />
    </div>
  );
}
