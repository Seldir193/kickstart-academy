import BookDialogBookingFields from "./BookDialogBookingFields";
import {
  BookingDetailsTitle,
  CampCard,
  DetailsSection,
  SummaryGrid,
} from "./BookDialogDetailsLayout";
import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogPowertrainingSection({ controller }: Props) {
  if (!controller.offers.isPowertraining) return null;
  return (
    <DetailsSection
      title={controller.t(
        "common.admin.customers.bookDialog.powertrainingDetails",
      )}
    >
      <CampCard
        eyebrow={controller.t(
          "common.admin.customers.bookDialog.holidayProgram",
        )}
        title={controller.t(
          "common.admin.customers.bookDialog.powertrainingDetails",
        )}
      >
        <PowertrainingSummary controller={controller} />
        <FooterBlock controller={controller} />
      </CampCard>
    </DetailsSection>
  );
}

function PowertrainingSummary({ controller }: Props) {
  return (
    <SummaryGrid
      items={[
        {
          label: controller.t("common.admin.customers.bookDialog.holiday"),
          value: controller.offers.holidayLabel || "—",
        },
        {
          label: controller.t("common.admin.customers.bookDialog.period"),
          value: controller.offers.holidayRange || "—",
        },
      ]}
    />
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
