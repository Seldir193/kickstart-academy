import type { TFunction } from "i18next";
import type { useFranchiseLocationDialogState } from "../hooks/useFranchiseLocationDialogState";

type Props = {
  model: ReturnType<typeof useFranchiseLocationDialogState>;
  onClose: () => void;
  t: TFunction;
};

export default function FranchiseLocationDialogHeader({
  model,
  onClose,
  t,
}: Props) {
  return (
    <div className="dialog-head fl-dialog__head">
      <HeaderText model={model} t={t} />
      <HeaderActions busy={model.busy} onClose={onClose} t={t} />
    </div>
  );
}

function HeaderText({ model, t }: Pick<Props, "model" | "t">) {
  return (
    <div className="fl-dialog__head-left">
      <div className="dialog-title fl-dialog__title">{model.title}</div>
      <div className="dialog-subtitle fl-dialog__subtitle">
        {t("common.admin.franchiseLocations.formDialog.subtitle")}
      </div>
      <StatusBadge isEdit={model.isEdit} t={t} />
    </div>
  );
}

function StatusBadge({ isEdit, t }: { isEdit: boolean; t: TFunction }) {
  return (
    <div className="fl-dialog__title-actions">
      <span className="dialog-status dialog-status--neutral">
        {badgeLabel(isEdit, t)}
      </span>
    </div>
  );
}

function HeaderActions({
  busy,
  onClose,
  t,
}: {
  busy: boolean;
  onClose: () => void;
  t: TFunction;
}) {
  return (
    <div className="fl-dialog__head-right">
      <div className="dialog-head__actions">
        <CloseButton busy={busy} onClose={onClose} t={t} />
      </div>
    </div>
  );
}

function CloseButton({
  busy,
  onClose,
  t,
}: {
  busy: boolean;
  onClose: () => void;
  t: TFunction;
}) {
  return (
    <button
      type="button"
      className="dialog-close modal__close"
      aria-label={t("common.admin.franchiseLocations.formDialog.close")}
      onClick={onClose}
      disabled={busy}
    >
      <img
        src="/icons/close.svg"
        alt=""
        aria-hidden="true"
        className="icon-img"
      />
    </button>
  );
}

function badgeLabel(isEdit: boolean, t: TFunction) {
  return isEdit
    ? t("common.admin.franchiseLocations.formDialog.badgeEdit")
    : t("common.admin.franchiseLocations.formDialog.badgeNew");
}
