import type { StornoBookingsState, StornoSubmitState, TFunc } from "../types";

type Props = {
  t: TFunc;
  bookings: StornoBookingsState;
  submit: StornoSubmitState;
};

export default function StornoDetailsSection({ t, bookings, submit }: Props) {
  return (
    <section className="dialog-section storno-dialog__detailsSection">
      <SectionHead t={t} />
      <div className="dialog-section__body ks-storno__section"><NoteField t={t} bookings={bookings} submit={submit} /></div>
    </section>
  );
}

function SectionHead({ t }: { t: TFunc }) {
  return <div className="dialog-section__head"><h4 className="dialog-section__title">{t("common.admin.customers.stornoDialog.detailsTitle")}</h4></div>;
}

function NoteField({ t, bookings, submit }: Props) {
  return (
    <div>
      <label className="dialog-label">{t("common.admin.customers.stornoDialog.noteOptional")}</label>
      <textarea className="input" rows={3} value={submit.note} onChange={(e) => submit.setNote(e.target.value)} placeholder={t("common.admin.customers.stornoDialog.notePlaceholder")} disabled={!bookings.selected || bookings.isCancelled} />
    </div>
  );
}
