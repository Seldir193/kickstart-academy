import type { TFunction } from "i18next";
import type { Customer } from "../../types";

export type CustomersTableProps = {
  items: Customer[];
  listLoading: boolean;
  showListLoading: boolean;
  onOpenEdit: (c: Customer) => void;
  disableTooltips: boolean;
};

export type CustomerTableRowProps = {
  customer: Customer;
  disableTooltips: boolean;
  onOpenEdit: (c: Customer) => void;
  t: TFunction;
};

export type CustomerRowType = {
  isCustomer: boolean;
  hasActive: boolean;
};
