import CustomersTable from "../CustomersTable";
import type { CustomersPageModel } from "./types";

type Props = { model: CustomersPageModel };

export default function CustomersTableSection({ model }: Props) {
  return <CustomersTable items={model.list.items} listLoading={model.list.listLoading} showListLoading={model.list.showListLoading} onOpenEdit={model.actions.openEditCustomer} disableTooltips={!!model.dialogs.editing || model.dialogs.createOpen} />;
}
