import NewsletterSelect from "../NewsletterSelect";
import type { CustomersFiltersState } from "./types";

type Props = { filters: CustomersFiltersState };

export default function CustomersNewsletterFilter({ filters }: Props) {
  return (
    <div className="ks-customers-toolbar__filter">
      <NewsletterSelect
        value={filters.newsletter}
        onChange={filters.setNewsletter}
        onAnyChange={() => filters.setPage(1)}
      />
    </div>
  );
}
