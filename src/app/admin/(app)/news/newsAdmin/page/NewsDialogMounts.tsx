import NewsDialog from "../../components/NewsDialog";
import DeleteNewsDialog from "../../moderation/DeleteNewsDialog";
import RejectDialog from "../../moderation/RejectDialog";
import NewsInfoDialog from "../../moderation/NewsInfoDialog";
import { getId } from "../helpers";
import type { DeleteDialogState, NewsAdminViewModel } from "./types";

export default function NewsDialogMounts({ p, d }: Props) {
  return (
    <>
      {createDialog(p)}
      {editDialog(p)}
      {deleteDialog(d)}
      {rejectDialog(p)}
      {infoDialog(p)}
    </>
  );
}

function createDialog(p: NewsAdminViewModel) {
  if (!p.createOpen) return null;
  return (
    <NewsDialog
      mode="create"
      initial={null}
      onClose={p.onCloseCreate}
      upload={p.upload}
      save={p.onSave}
      remove={p.onDeleteById}
    />
  );
}

function editDialog(p: NewsAdminViewModel) {
  if (!p.editItem) return null;
  return (
    <NewsDialog
      mode="edit"
      initial={p.editItem}
      onClose={p.onCloseEdit}
      upload={p.upload}
      save={p.onSave}
      remove={(id) => removeEdited(id, p)}
    />
  );
}

function deleteDialog(d: DeleteDialogState) {
  return (
    <DeleteNewsDialog
      open={d.open}
      newsTitle={d.deleteName(d.target)}
      onClose={d.closeDelete}
      onConfirm={d.confirmDelete}
    />
  );
}

function rejectDialog(p: NewsAdminViewModel) {
  if (!p.rejectOpen) return null;
  return (
    <RejectDialog
      open={p.rejectOpen}
      title={p.rejectTitle}
      onClose={p.onCloseReject}
      onSubmit={p.onSubmitReject}
    />
  );
}

function infoDialog(p: NewsAdminViewModel) {
  if (!p.infoOpen) return null;
  return (
    <NewsInfoDialog
      open={p.infoOpen}
      item={p.infoTarget}
      onClose={p.onCloseInfo}
    />
  );
}

async function removeEdited(id: string, p: NewsAdminViewModel) {
  const nextId = id || getId(p.editItem) || "";
  if (!nextId) return;
  await p.onDeleteById(nextId);
  p.onCloseEdit();
}

type Props = { p: NewsAdminViewModel; d: DeleteDialogState };
