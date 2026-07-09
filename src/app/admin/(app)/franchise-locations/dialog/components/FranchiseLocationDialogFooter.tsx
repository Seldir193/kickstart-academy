import type { TFunction } from "i18next";
import type { useFranchiseLocationDialogState } from "../hooks/useFranchiseLocationDialogState";
import type { FranchiseLocationDialogProps } from "../types";

type Props = {
  model: ReturnType<typeof useFranchiseLocationDialogState>;
  onDelete: FranchiseLocationDialogProps["onDelete"];
  t: TFunction;
};

export default function FranchiseLocationDialogFooter({ model, onDelete, t }: Props) {
  return (
    <div className="dialog-footer fl-dialog__footer">
      <div className="fl-dialog__footer-left">
        <DeleteSlot model={model} onDelete={onDelete} t={t} />
      </div>
      <div className="fl-dialog__footer-right">
        <SaveButton model={model} t={t} />
      </div>
    </div>
  );
}

function DeleteSlot({ model, onDelete, t }: Props) {
  if (!onDelete || !model.isEdit) return <span />;
  return (
    <button className="btn btn--danger" onClick={model.actions.handleDelete} disabled={model.busy} type="button">
      {t("common.admin.franchiseLocations.formDialog.delete")}
    </button>
  );
}

function SaveButton({ model, t }: Pick<Props, "model" | "t">) {
  return (
    <button className="btn" onClick={model.actions.submit} disabled={model.busy} type="button">
      {saveLabel(model.busy, t)}
    </button>
  );
}

function saveLabel(busy: boolean, t: TFunction) {
  return busy
    ? t("common.admin.franchiseLocations.formDialog.saving")
    : t("common.admin.franchiseLocations.formDialog.save");
}
