import type { TFunc } from "../types";

export default function CancelDialogHeader({ t, onClose }: { t: TFunc; onClose: () => void }) {
  return (
    <div className="dialog-head cancel-dialog__head">
      <HeaderText t={t} />
      <HeaderActions t={t} onClose={onClose} />
    </div>
  );
}

function HeaderText({ t }: { t: TFunc }) {
  return (
    <div className="cancel-dialog__head-main">
      <h3 id="cancel-dialog-title" className="dialog-title">{t("common.admin.customers.cancelDialog.title")}</h3>
      <p className="dialog-subtitle">{t("common.admin.customers.cancelDialog.subtitle")}</p>
    </div>
  );
}

function HeaderActions({ t, onClose }: { t: TFunc; onClose: () => void }) {
  return (
    <div className="dialog-head__actions">
      <button type="button" className="dialog-close" aria-label={t("common.actions.close")} onClick={onClose}>
        <img src="/icons/close.svg" alt="" aria-hidden="true" className="icon-img" />
      </button>
    </div>
  );
}
