import { fetchCustomer } from "./customerPageApi";
import type { CustomersDialogsState, CustomersListState } from "./types";
import type { Customer } from "../../types";

type Args = {
  dialogs: CustomersDialogsState & {
    setEditing: (customer: Customer | null) => void;
  };
  list: CustomersListState;
};

export function useCustomersPageActions({ dialogs, list }: Args) {
  return {
    openEditCustomer: openEditCustomer(dialogs),
    afterCreate: afterCreate(dialogs, list),
    afterEditClose: afterEditClose(dialogs, list),
  };
}

function openEditCustomer(dialogs: Args["dialogs"]) {
  return async (customer: Customer) => {
    const full = await fetchCustomer(customer._id);
    dialogs.setEditing(full || customer);
  };
}

function afterCreate(dialogs: Args["dialogs"], list: CustomersListState) {
  return async () => {
    dialogs.closeCreate();
    await list.reload();
  };
}

function afterEditClose(dialogs: Args["dialogs"], list: CustomersListState) {
  return async () => {
    dialogs.closeEdit();
    await list.reload();
  };
}
