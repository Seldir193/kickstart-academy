import type { KeyboardEvent, MouseEvent } from "react";
import type { TFunction } from "i18next";
import type { Customer } from "../../types";

type Props = {
  customer: Customer;
  onOpenEdit: (c: Customer) => void;
  t: TFunction;
};

function isActionKey(key: string): boolean {
  return key === "Enter" || key === " ";
}

export function handleActionClick(event: MouseEvent<HTMLDivElement>) {
  event.stopPropagation();
}

export function handleRowKey(event: KeyboardEvent<HTMLDivElement>, action: () => void) {
  if (!isActionKey(event.key)) return;
  event.preventDefault();
  action();
}

function handleEditKey(event: KeyboardEvent<HTMLSpanElement>, action: () => void) {
  if (!isActionKey(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  action();
}

function editActionProps({ customer, onOpenEdit, t }: Props) {
  return {
    className: "edit-trigger",
    role: "button" as const,
    tabIndex: 0,
    title: t("admin.customers.table.actions.edit"),
    "aria-label": t("admin.customers.table.actions.edit"),
    onClick: () => onOpenEdit(customer),
    onKeyDown: (event: KeyboardEvent<HTMLSpanElement>) => handleEditKey(event, () => onOpenEdit(customer)),
  };
}

export default function CustomerEditAction(props: Props) {
  return (
    <span {...editActionProps(props)}>
      <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
    </span>
  );
}
