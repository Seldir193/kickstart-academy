import CustomersCreateButton from "./CustomersCreateButton";
import CustomersNewsletterFilter from "./CustomersNewsletterFilter";
import CustomersSearch from "./CustomersSearch";
import CustomersTabs from "./CustomersTabs";
import type { CustomersPageModel } from "./types";

type Props = { model: CustomersPageModel; t: (key: string) => string };

export default function CustomersToolbar({ model, t }: Props) {
  return <div className="ks-customers-toolbar mb-3"><CustomersTabs filters={model.filters} t={t} /><CustomersSearch filters={model.filters} t={t} /><CustomersNewsletterFilter filters={model.filters} /><CustomersCreateButton label={t("admin.customers.page.actions.newCustomer")} onClick={() => model.dialogs.setCreateOpen(true)} /></div>;
}
