import { formatDateOnly, formatDateTime } from "../../utils";
import type {
  BookingDialogModel,
  BookingDialogProps,
  Translate,
} from "../types";
import BookingDetailRow from "./BookingDetailRow";

type Props = Pick<BookingDialogProps, "booking"> & {
  model: BookingDialogModel;
  t: Translate;
  lang?: string;
};

type Row = { label: string; value: string | number; full?: boolean };

export default function BookingDetailsSection({
  booking,
  model,
  t,
  lang,
}: Props) {
  return (
    <section className="dialog-section booking-dialog__section">
      <SectionHead t={t} />
      <div className="dialog-section__body">
        <div className="booking-dialog__details">
          {rows(booking, model, t, lang).map((row) => (
            <BookingDetailRow key={row.label} {...row} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ t }: { t: Translate }) {
  return (
    <div className="dialog-section__head">
      <h3 className="dialog-section__title booking-dialog__section-title">
        {t("common.admin.bookings.dialog.sections.booking")}
      </h3>
    </div>
  );
}

function rows(
  booking: Props["booking"],
  model: BookingDialogModel,
  t: Translate,
  lang?: string,
) {
  return [
    ...baseRows(booking, model, t, lang),
    ...approvalRows(booking, model, t, lang),
    ...codeRows(booking, t),
    ...invoiceRows(booking, model, t, lang),
  ];
}

function baseRows(
  booking: Props["booking"],
  model: BookingDialogModel,
  t: Translate,
  lang?: string,
): Row[] {
  return [
    programRow(model, t),
    venueRow(model, t),
    ...scheduleRows(model, t),
    nameRow(booking, t),
    emailRow(booking, t),
    ageRow(booking, t),
    dateRow(booking, model, t, lang),
    createdRow(booking, t, lang),
  ];
}

function programRow(model: BookingDialogModel, t: Translate): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.program"),
    value: model.programText,
    full: true,
  };
}

function venueRow(model: BookingDialogModel, t: Translate): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.venue"),
    value: model.venueText,
    full: true,
  };
}

function scheduleRows(model: BookingDialogModel, t: Translate): Row[] {
  if (model.hasRegularCourseLine) return regularCourseRows(model, t);
  return model.scheduleLine ? [scheduleRow(model, t)] : [];
}

function regularCourseRows(model: BookingDialogModel, t: Translate): Row[] {
  return [
    regularCourseRow(model, t),
    {
      label: t("common.admin.bookings.dialog.labels.note"),
      value: t("common.admin.bookings.dialog.weeklyHolidayNotice"),
      full: true,
    },
  ];
}

function regularCourseRow(model: BookingDialogModel, t: Translate): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.regularCourseTime"),
    value: model.regularCourseLine,
    full: true,
  };
}

function scheduleRow(model: BookingDialogModel, t: Translate): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.schedule"),
    value: model.scheduleLine,
    full: true,
  };
}

function nameRow(booking: Props["booking"], t: Translate): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.name"),
    value: `${booking.firstName} ${booking.lastName}`,
  };
}

function emailRow(booking: Props["booking"], t: Translate): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.email"),
    value: booking.email || t("common.admin.bookings.dialog.empty"),
  };
}

function ageRow(booking: Props["booking"], t: Translate): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.age"),
    value: booking.age ?? t("common.admin.bookings.dialog.empty"),
  };
}

function dateRow(
  booking: Props["booking"],
  model: BookingDialogModel,
  t: Translate,
  lang?: string,
): Row {
  return {
    label: model.isWishDate
      ? t("common.admin.bookings.dialog.labels.preferredDate")
      : t("common.admin.bookings.dialog.labels.dateStartDate"),
    value: formatDateOnly(booking.date, lang),
  };
}

function createdRow(
  booking: Props["booking"],
  t: Translate,
  lang?: string,
): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.created"),
    value: formatDateTime(booking.createdAt, lang),
  };
}

function approvalRows(
  booking: Props["booking"],
  model: BookingDialogModel,
  t: Translate,
  lang?: string,
): Row[] {
  return [approvalRow(booking, model, t, lang)];
}

function approvalRow(
  booking: Props["booking"],
  model: BookingDialogModel,
  t: Translate,
  lang?: string,
): Row {
  return {
    label: approvalLabel(model, t),
    value: approvalValue(booking, model, lang),
  };
}

function approvalLabel(model: BookingDialogModel, t: Translate) {
  return model.isOneTimeType
    ? t("common.admin.bookings.dialog.labels.paymentApprovedAt")
    : t("common.admin.bookings.dialog.labels.subscriptionApprovedAt");
}

function approvalValue(
  booking: Props["booking"],
  model: BookingDialogModel,
  lang?: string,
) {
  const value = model.isOneTimeType
    ? booking.meta?.paymentApprovedAt
    : booking.meta?.subscriptionEligibleAt;
  return value ? formatDateTime(value, lang) : "—";
}

function codeRows(booking: Props["booking"], t: Translate): Row[] {
  return [
    {
      label: t("common.admin.bookings.dialog.labels.confirmationCode"),
      value:
        booking.confirmationCode || t("common.admin.bookings.dialog.empty"),
    },
  ];
}

function invoiceRows(
  booking: Props["booking"],
  model: BookingDialogModel,
  t: Translate,
  lang?: string,
): Row[] {
  if (!model.showInvoiceDetails) return [];
  return [invoiceNumberRow(booking, t), invoiceDateRow(booking, t, lang)];
}

function invoiceNumberRow(booking: Props["booking"], t: Translate): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.invoiceNumber"),
    value:
      booking.invoiceNumber ||
      booking.invoiceNo ||
      t("common.admin.bookings.dialog.empty"),
  };
}

function invoiceDateRow(
  booking: Props["booking"],
  t: Translate,
  lang?: string,
): Row {
  return {
    label: t("common.admin.bookings.dialog.labels.invoiceDate"),
    value: formatDateOnly(booking.invoiceDate, lang),
  };
}
