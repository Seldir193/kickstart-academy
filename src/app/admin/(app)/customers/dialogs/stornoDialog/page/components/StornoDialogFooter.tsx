import type { StornoSubmitState, TFunc } from "../types";

type Props = { t: TFunc; submit: StornoSubmitState };

export default function StornoDialogFooter({ t, submit }: Props) {
  return (
    <div className="dialog-footer storno-dialog__footer">
      <div className="storno-dialog__footerActions">
        <button className="btn storno-dialog__confirmBtn" disabled={submit.disabled} onClick={submit.submit}>
          {submit.saving ? t("common.admin.customers.stornoDialog.processing") : t("common.admin.customers.stornoDialog.confirm")}
        </button>
      </div>
    </div>
  );
}
