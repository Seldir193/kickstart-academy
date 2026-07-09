import type { CustomersFiltersState } from "./types";

type Props = { filters: CustomersFiltersState; t: (key: string) => string };

export default function CustomersSearch({ filters, t }: Props) {
  return <div className="ks-customers-toolbar__search"><div className="input-with-icon"><img src="/icons/search.svg" alt="" aria-hidden="true" className="input-with-icon__icon" /><input className="input input-with-icon__input" placeholder={t("admin.customers.page.search.placeholder")} aria-label={t("admin.customers.page.search.ariaLabel")} value={filters.q} onChange={(e) => filters.onQueryChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") filters.resetSearch(); }} /></div></div>;
}
