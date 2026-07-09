import type { Dispatch, SetStateAction } from "react";
import type { Customer } from "../../types";
import type { NewsletterFilter, Tab } from "../../hooks/useCustomersList";
import type { useCustomersList } from "../../hooks/useCustomersList";

export type CustomersListState = ReturnType<typeof useCustomersList>;

export type CustomersFiltersState = {
  q: string;
  tab: Tab;
  newsletter: NewsletterFilter;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  setNewsletter: Dispatch<SetStateAction<NewsletterFilter>>;
  switchTab: (next: Tab) => void;
  onQueryChange: (next: string) => void;
  resetSearch: () => void;
};

export type CustomersDialogsState = {
  editing: Customer | null;
  createOpen: boolean;
  setCreateOpen: Dispatch<SetStateAction<boolean>>;
  closeCreate: () => void;
  closeEdit: () => void;
};

export type CustomersPaginationState = {
  pages: number;
  goPrev: () => void;
  goNext: () => void;
};

export type CustomersPageActions = {
  openEditCustomer: (customer: Customer) => Promise<void>;
  afterCreate: () => Promise<void>;
  afterEditClose: () => Promise<void>;
};

export type CustomersPageModel = {
  filters: CustomersFiltersState;
  dialogs: CustomersDialogsState;
  pagination: CustomersPaginationState;
  actions: CustomersPageActions;
  list: CustomersListState;
};
