import type { TFunc } from "../types";

type Props = { t: TFunc; onClose: () => void };

export default function BookDialogHeader({ t, onClose }: Props) {
  return <div className="dialog-head book-dialog__head"><div className="book-dialog__head-main"><h3 id="book-dialog-title" className="dialog-title">{t("common.admin.customers.bookDialog.title")}</h3><p className="dialog-subtitle">{t("common.admin.customers.bookDialog.subtitle")}</p></div><div className="dialog-head__actions"><button type="button" className="dialog-close" aria-label={t("common.actions.close")} onClick={onClose}><img src="/icons/close.svg" alt="" aria-hidden="true" className="icon-img" /></button></div></div>;
}
