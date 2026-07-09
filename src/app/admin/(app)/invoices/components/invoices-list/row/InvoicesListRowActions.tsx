import { InvoiceRowActionButton } from "./InvoiceRowActionButton";
import { invoiceRowActions } from "./invoiceRowActions";
import type { InvoiceRowActionFactoryArgs } from "./types";

export function InvoicesListRowActions(props: InvoiceRowActionFactoryArgs) {
  const actions = invoiceRowActions(props);

  return (
    <div className="list__actions ks-invoices__hoverActions">
      {actions.map((action) => (
        <InvoiceRowActionButton key={action.key} action={action} />
      ))}
    </div>
  );
}
