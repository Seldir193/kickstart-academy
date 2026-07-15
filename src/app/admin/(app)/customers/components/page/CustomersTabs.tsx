import CustomersTabButton from "./CustomersTabButton";
import type { CustomersFiltersState } from "./types";

type Props = { filters: CustomersFiltersState; t: (key: string) => string };

export default function CustomersTabs({ filters, t }: Props) {
  return (
    <div className="ks-customers-toolbar__tabs">
      <CustomersTabButton
        tab="customers"
        current={filters.tab}
        label={t("admin.customers.page.tabs.customers")}
        onClick={filters.switchTab}
      />
      <CustomersTabButton
        tab="newsletter"
        current={filters.tab}
        label={t("admin.customers.page.tabs.newsletterLeads")}
        onClick={filters.switchTab}
      />
      <CustomersTabButton
        tab="all"
        current={filters.tab}
        label={t("admin.customers.page.tabs.all")}
        onClick={filters.switchTab}
      />
    </div>
  );
}
