import CustomerChildrenCell from "./CustomerChildrenCell";
import CustomerEditAction, { handleActionClick } from "./CustomerEditAction";
import CustomerStatusBadge, { CustomerTypeBadge } from "./CustomerStatusBadge";
import {
  addressText,
  emailText,
  newsletterLabel,
  parentName,
} from "./customerTableData";
import type { CustomerTableRowProps, CustomerRowType } from "./types";

type IdentityProps = CustomerTableRowProps & { empty: string };

type BadgeProps = {
  row: CustomerRowType;
  t: CustomerTableRowProps["t"];
};

function CustomerCoreCells(props: IdentityProps) {
  const { customer, disableTooltips, t, empty } = props;
  return (
    <>
      <div className="ks-customers-list__cell ks-customers-list__cell--mono">
        {customer.userId ?? empty}
      </div>
      <div className="ks-customers-list__cell ks-customers-list__cell--children">
        <CustomerChildrenCell
          customer={customer}
          disableTooltips={disableTooltips}
          t={t}
        />
      </div>
      <div className="ks-customers-list__cell">{parentName(customer, t)}</div>
    </>
  );
}

function CustomerContactCells({ customer, t }: IdentityProps) {
  return (
    <>
      <div className="ks-customers-list__cell">{emailText(customer, t)}</div>
      <div className="ks-customers-list__cell">{addressText(customer, t)}</div>
      <div className="ks-customers-list__cell">
        {newsletterLabel(customer, t)}
      </div>
    </>
  );
}

export function CustomerIdentityCells(props: IdentityProps) {
  return (
    <>
      <CustomerCoreCells {...props} />
      <CustomerContactCells {...props} />
    </>
  );
}

export function CustomerBadgeCells({ row, t }: BadgeProps) {
  return (
    <>
      <div className="ks-customers-list__cell">
        <CustomerTypeBadge row={row} t={t} />
      </div>
      <div className="ks-customers-list__cell">
        <CustomerStatusBadge row={row} t={t} />
      </div>
    </>
  );
}

export function CustomerActionCell({
  customer,
  onOpenEdit,
  t,
}: CustomerTableRowProps) {
  return (
    <div
      className="ks-customers-list__cell ks-customers-list__cell--action"
      onClick={handleActionClick}
    >
      <CustomerEditAction customer={customer} onOpenEdit={onOpenEdit} t={t} />
    </div>
  );
}
