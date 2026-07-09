import type { TFunction } from "i18next";
import type { CustomerRowType } from "./types";

type Props = {
  row: CustomerRowType;
  t: TFunction;
};

function statusClass(active: boolean): string {
  return `ks-customers-list__badge ${active ? "is-active" : "is-inactive"}`;
}

export function CustomerTypeBadge({ row, t }: Props) {
  const key = row.isCustomer ? "customer" : "lead";
  return <span className="ks-customers-list__badge">{t(`admin.customers.table.type.${key}`)}</span>;
}

export default function CustomerStatusBadge({ row, t }: Props) {
  const key = row.hasActive ? "active" : "noActive";
  return <span className={statusClass(row.hasActive)}>{t(`admin.customers.table.status.${key}`)}</span>;
}
