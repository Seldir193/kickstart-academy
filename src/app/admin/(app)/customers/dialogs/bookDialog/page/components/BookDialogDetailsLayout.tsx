import type { ReactNode } from "react";
import type { TFunc } from "../types";

type Props = { title: string; children: ReactNode };

type CardProps = { eyebrow: string; title: string; children: ReactNode };

export function DetailsSection({ title, children }: Props) {
  return (
    <section className="dialog-section book-dialog__detailsSection">
      <div className="dialog-section__head">
        <h4 className="dialog-section__title">{title}</h4>
      </div>
      <div className="dialog-section__body">
        <section className="camp-options camp-options--premium">
          {children}
        </section>
      </div>
    </section>
  );
}

export function CampCard({ eyebrow, title, children }: CardProps) {
  return (
    <div className="camp-card">
      <div className="camp-card__head">
        <div>
          <div className="camp-card__eyebrow">{eyebrow}</div>
          <div className="camp-card__title">{title}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SummaryGrid({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="camp-summary-grid">
      {items.map((item) => (
        <SummaryItem key={item.label} item={item} />
      ))}
    </div>
  );
}

export function BookingDetailsTitle({ t }: { t: TFunc }) {
  return (
    <div className="camp-block__title">
      {t("common.admin.customers.bookDialog.bookingDetails")}
    </div>
  );
}

function SummaryItem({ item }: { item: { label: string; value: string } }) {
  return (
    <div className="camp-summary-item">
      <span className="camp-summary-item__label">{item.label}</span>
      <span className="camp-summary-item__value">{item.value}</span>
    </div>
  );
}
