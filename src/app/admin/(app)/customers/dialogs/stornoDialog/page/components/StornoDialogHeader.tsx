import type { TFunc } from "../types";

type Props = { t: TFunc; onClose: () => void };

export default function StornoDialogHeader({ t, onClose }: Props) {
  return (
    <div className="dialog-head storno-dialog__head">
      <div className="storno-dialog__head-main">
        <h3 id="storno-dialog-title" className="dialog-title">{t("common.admin.customers.stornoDialog.title")}</h3>
        <p className="dialog-subtitle">{t("common.admin.customers.stornoDialog.subtitle")}</p>
      </div>
      <div className="dialog-head__actions"><CloseButton t={t} onClose={onClose} /></div>
    </div>
  );
}

function CloseButton({ t, onClose }: Props) {
  return (
    <button type="button" className="dialog-close" aria-label={t("common.admin.customers.stornoDialog.close")} onClick={onClose}>
      <img src="/icons/close.svg" alt="" aria-hidden="true" className="icon-img" />
    </button>
  );
}
