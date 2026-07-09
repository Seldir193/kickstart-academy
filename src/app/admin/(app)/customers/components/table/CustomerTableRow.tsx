import type { KeyboardEvent } from "react";
import { handleRowKey } from "./CustomerEditAction";
import { rowType } from "./customerTableData";
import { CustomerActionCell, CustomerBadgeCells, CustomerIdentityCells } from "./CustomerRowCells";
import type { CustomerTableRowProps } from "./types";

function rowProps(props: CustomerTableRowProps) {
  return {
    className: "ks-customers-list__row",
    role: "button" as const,
    tabIndex: 0,
    onClick: () => props.onOpenEdit(props.customer),
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => handleRowKey(event, () => props.onOpenEdit(props.customer)),
  };
}

export default function CustomerTableRow(props: CustomerTableRowProps) {
  const row = rowType(props.customer);
  const empty = props.t("admin.customers.table.common.empty");
  return (
    <div {...rowProps(props)}>
      <CustomerIdentityCells {...props} empty={empty} />
      <CustomerBadgeCells row={row} t={props.t} />
      <CustomerActionCell {...props} />
    </div>
  );
}
