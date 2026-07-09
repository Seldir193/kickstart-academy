import type { BookingDialogModel, MessageLine, Translate } from "../types";

type Props = {
  model: BookingDialogModel;
  t: Translate;
};

export default function BookingMessageSection({ model, t }: Props) {
  return <section className="dialog-section booking-dialog__section"><SectionHead t={t} /><div className="dialog-section__body"><MessageContent lines={model.messageLines} t={t} /></div></section>;
}

function SectionHead({ t }: { t: Translate }) {
  return <div className="dialog-section__head"><h3 className="dialog-section__title booking-dialog__section-title">{t("common.admin.bookings.dialog.sections.message")}</h3></div>;
}

function MessageContent({ lines, t }: { lines: MessageLine[]; t: Translate }) {
  if (!lines.length) return <div className="dialog-value">{t("common.admin.bookings.dialog.empty")}</div>;
  return <div className="booking-dialog__message-list">{lines.map((line, index) => <MessageRow key={`${line.raw}-${index}`} line={line} t={t} />)}</div>;
}

function MessageRow({ line, t }: { line: MessageLine; t: Translate }) {
  if (!line.label) return <div className="booking-dialog__message-line"><div className="dialog-value">{line.raw}</div></div>;
  return <div className="booking-dialog__message-row"><div className="dialog-label">{line.label}</div><div className="dialog-value">{line.value || t("common.admin.bookings.dialog.empty")}</div></div>;
}
