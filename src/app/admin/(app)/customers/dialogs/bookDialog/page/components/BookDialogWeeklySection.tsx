import BookDialogBookingFields from "./BookDialogBookingFields";
import { BookingDetailsTitle, CampCard, DetailsSection, SummaryGrid } from "./BookDialogDetailsLayout";
import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogWeeklySection({ controller }: Props) {
  if (!controller.offers.isWeekly) return null;
  return <DetailsSection title={controller.t("common.admin.customers.bookDialog.subscriptionDetails")}><CampCard eyebrow={controller.t("common.admin.customers.bookDialog.subscriptionBooking")} title={controller.t("common.admin.customers.bookDialog.bookingDetails")}><WeeklySummary controller={controller} /><FooterBlock controller={controller} /></CampCard></DetailsSection>;
}

function WeeklySummary({ controller }: Props) {
  if (!controller.offers.regularCourseLine) return null;
  return <SummaryGrid items={[{ label: controller.t("common.admin.customers.bookDialog.regularCourseTime"), value: controller.offers.regularCourseLine }, { label: controller.t("common.admin.customers.bookDialog.hint"), value: controller.offers.weeklyHolidayNotice }]} />;
}

function FooterBlock({ controller }: Props) {
  return <div className="camp-block camp-block--footer"><BookingDetailsTitle t={controller.t} /><BookDialogBookingFields controller={controller} /></div>;
}
