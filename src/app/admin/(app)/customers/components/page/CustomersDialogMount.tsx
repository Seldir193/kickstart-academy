import CustomerDialog from "../../dialogs/CustomerDialog";
import type { CustomersPageModel } from "./types";

type Props = { model: CustomersPageModel };

export default function CustomersDialogMount({ model }: Props) {
  return <><CreateDialog model={model} /><EditDialog model={model} /></>;
}

function CreateDialog({ model }: Props) {
  if (!model.dialogs.createOpen) return null;
  return <CustomerDialog mode="create" onClose={model.dialogs.closeCreate} onCreated={model.actions.afterCreate} />;
}

function EditDialog({ model }: Props) {
  if (!model.dialogs.editing) return null;
  return <CustomerDialog mode="edit" customer={model.dialogs.editing} onClose={model.dialogs.closeEdit} onSaved={model.actions.afterEditClose} onDeleted={model.actions.afterEditClose} />;
}
