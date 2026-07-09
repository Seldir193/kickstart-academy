import type React from "react";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import { todayISO } from "../../formatters";
import type { CancelBookingsState, CancelSubmitState, TFunc } from "../types";

type Props = { t: TFunc; bookings: CancelBookingsState; submit: CancelSubmitState };

export default function CancelDetailsSection(props: Props) {
  return (
    <section className="dialog-section cancel-dialog__detailsSection">
      <SectionHead t={props.t} />
      <div className="dialog-section__body ks-storno__section"><DateFields {...props} /><ReasonField {...props} /><DetailNotes {...props} /></div>
    </section>
  );
}

function SectionHead({ t }: { t: TFunc }) {
  return <div className="dialog-section__head"><h4 className="dialog-section__title">{t("common.admin.customers.cancelDialog.detailsTitle")}</h4></div>;
}

function DateFields(props: Props) {
  return <><CancelDateField {...props} /><EndDateField {...props} /></>;
}

function CancelDateField({ t, bookings, submit }: Props) {
  return <div><DateField label={t("common.admin.customers.cancelDialog.receiptDateRequired")} value={submit.cancelDate} onChange={(nextIso) => changeCancelDate(nextIso, submit)} disabled={dateDisabled(bookings, submit)} placeholder={t("common.placeholders.date")} /></div>;
}

function EndDateField({ t, bookings, submit }: Props) {
  return (
    <div>
      <DateField label={t("common.admin.customers.cancelDialog.endDateRequired")} value={submit.endDate} onChange={(nextIso) => changeEndDate(nextIso, submit)} disabled={dateDisabled(bookings, submit)} placeholder={t("common.placeholders.date")} />
      {submit.endBeforeStart && <div className="cancel-dialog__error mt-1">{t("common.admin.customers.cancelDialog.endDateAfterReceipt")}</div>}
    </div>
  );
}

function DateField(props: { label: string; value: string; onChange: (nextIso: string) => void; disabled: boolean; placeholder: string }) {
  return <><label className="dialog-label">{props.label}</label><KsDatePicker value={props.value} onChange={props.onChange} placeholder={props.placeholder} disabled={props.disabled} /></>;
}

function changeCancelDate(nextIso: string, submit: CancelSubmitState) {
  const minIso = todayISO();
  if (nextIso && nextIso < minIso) return;
  submit.setCancelDate(nextIso);
}

function changeEndDate(nextIso: string, submit: CancelSubmitState) {
  const minIso = submit.cancelDate || todayISO();
  if (nextIso && nextIso < minIso) return;
  submit.setEndDate(nextIso);
}

function dateDisabled(bookings: CancelBookingsState, submit: CancelSubmitState) {
  return !bookings.selected || bookings.selectedIsCancelled || submit.disabledByNonCancelableCourse;
}

function ReasonField({ t, bookings, submit }: Props) {
  return <div><label className="dialog-label">{t("common.admin.customers.cancelDialog.reasonOptional")}</label><textarea className="input" rows={3} value={submit.reason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => submit.setReason(e.target.value)} placeholder={t("common.admin.customers.cancelDialog.reasonPlaceholder")} disabled={dateDisabled(bookings, submit)} /></div>;
}

function DetailNotes({ t, bookings, submit }: Props) {
  return <>{bookings.selected && bookings.selectedIsCancelled && <div className="cancel-dialog__note">{t("common.admin.customers.cancelDialog.alreadyCancelled")}</div>}{submit.disabledByNonCancelableCourse && <div className="cancel-dialog__note">{t("common.admin.customers.cancelDialog.cancellationsNotAllowed")}</div>}</>;
}
