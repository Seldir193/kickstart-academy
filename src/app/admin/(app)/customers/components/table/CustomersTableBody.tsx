import type { TFunction } from "i18next";
import type { Customer } from "../../types";
import CustomerTableRow from "./CustomerTableRow";

type Props = {
  items: Customer[];
  listLoading: boolean;
  disableTooltips: boolean;
  onOpenEdit: (c: Customer) => void;
  t: TFunction;
};

export default function CustomersTableBody({ items, listLoading, disableTooltips, onOpenEdit, t }: Props) {
  return (
    <div className="ks-customers-list__body">
      {items.map((customer) => (
        <CustomerTableRow key={customer._id} customer={customer} disableTooltips={disableTooltips} onOpenEdit={onOpenEdit} t={t} />
      ))}
      {!items.length && !listLoading && <div className="ks-customers-list__empty">{t("admin.customers.table.empty")}</div>}
    </div>
  );
}
