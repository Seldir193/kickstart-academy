import type { CancelSubmitState, TFunc } from "../types";

export default function CancelDialogFooter({ t, submit }: { t: TFunc; submit: CancelSubmitState }) {
  return (
    <div className="dialog-footer cancel-dialog__footer">
      <div className="cancel-dialog__footerActions">
        <button className="btn cancel-dialog__confirmBtn" disabled={submit.disabled} onClick={submit.submit}>
          {buttonLabel(t, submit.saving)}
        </button>
      </div>
    </div>
  );
}

function buttonLabel(t: TFunc, saving: boolean) {
  return saving ? t("common.admin.customers.cancelDialog.cancelling") : t("common.admin.customers.cancelDialog.confirmCancellation");
}
