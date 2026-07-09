import type { TFunction } from "i18next";
import DialogBody from "./FranchiseLocationDialogBody";
import DialogFooter from "./FranchiseLocationDialogFooter";
import DialogHeader from "./FranchiseLocationDialogHeader";
import type { useFranchiseLocationDialogState } from "../hooks/useFranchiseLocationDialogState";
import type { FranchiseLocationDialogProps } from "../types";

type Props = {
  props: FranchiseLocationDialogProps;
  model: ReturnType<typeof useFranchiseLocationDialogState>;
  t: TFunction;
};

export default function FranchiseLocationDialogView({ props, model, t }: Props) {
  return (
    <div className="dialog-backdrop fl-dialog" role="dialog" aria-modal="true">
      <BackdropCloseButton onClose={props.onClose} t={t} />
      <div className="dialog fl-dialog__dialog">
        <DialogHeader model={model} onClose={props.onClose} t={t} />
        <DialogBody model={model} t={t} />
        <DialogFooter model={model} onDelete={props.onDelete} t={t} />
      </div>
    </div>
  );
}

function BackdropCloseButton({ onClose, t }: Pick<Props["props"], "onClose"> & { t: TFunction }) {
  return (
    <button
      type="button"
      className="dialog-backdrop-hit fl-dialog__backdrop-hit"
      aria-label={t("common.admin.franchiseLocations.formDialog.close")}
      onClick={onClose}
    />
  );
}
