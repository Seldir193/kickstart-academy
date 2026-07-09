import { useCustomersList } from "../../hooks/useCustomersList";
import { useCustomersDialogsState } from "./useCustomersDialogsState";
import { useCustomersFiltersState } from "./useCustomersFiltersState";
import { useCustomersPageActions } from "./useCustomersPageActions";
import { useCustomersPaginationState } from "./useCustomersPaginationState";

const PAGE_LIMIT = 10;

export function useCustomersPageState() {
  const filters = useCustomersFiltersState();
  const dialogs = useCustomersDialogsState();
  const list = useCustomersList({ q: filters.q, tab: filters.tab, newsletter: filters.newsletter, page: filters.page, limit: PAGE_LIMIT });
  const pagination = useCustomersPaginationState(list.total, PAGE_LIMIT, filters.page, filters.setPage);
  const actions = useCustomersPageActions({ dialogs, list });
  return { filters, dialogs, pagination, actions, list };
}
