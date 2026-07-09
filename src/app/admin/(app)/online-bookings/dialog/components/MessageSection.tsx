import type { MessageRow, Translate } from "../types";

export function MessageSection({ rows, t }: { rows: MessageRow[]; t: Translate }) {
  return (
    <section className="dialog-section online-booking-dialog__section">
      <SectionHead title={t("common.admin.onlineBookings.dialog.section.message")} />
      <div className="dialog-section__body">
        {rows.length ? <MessageList rows={rows} /> : <div className="dialog-value">—</div>}
      </div>
    </section>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="dialog-section__head">
      <h3 className="dialog-section__title online-booking-dialog__section-title">{title}</h3>
    </div>
  );
}

function MessageList({ rows }: { rows: MessageRow[] }) {
  return (
    <div className="online-booking-dialog__message-list">
      {rows.map((row, i) => <MessageRowItem key={i} row={row} />)}
    </div>
  );
}

function MessageRowItem({ row }: { row: MessageRow }) {
  if (!row.label) return <MessageLine value={row.value} />;
  return <MessageLabelRow row={row} />;
}

function MessageLine({ value }: { value: string }) {
  return (
    <div className="online-booking-dialog__message-line">
      <div className="dialog-value">{value}</div>
    </div>
  );
}

function MessageLabelRow({ row }: { row: MessageRow }) {
  return (
    <div className="online-booking-dialog__message-row">
      <div className="dialog-label">{row.label}</div>
      <div className="dialog-value">{row.value || "—"}</div>
    </div>
  );
}
