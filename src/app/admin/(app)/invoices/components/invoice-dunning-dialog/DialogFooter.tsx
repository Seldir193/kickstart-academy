"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { RowActionState } from "../../hooks/useInvoiceRowActions";

type Props = {
  state: RowActionState;
  onSubmitReturned: () => void;
  onSubmitDunning: () => void;
  onSubmitRefund: () => void;
  onSubmitWithdraw: () => void;
};

function noticeClass(tone?: string) {
  if (tone === "success") return " is-success";
  if (tone === "error") return " is-error";
  return "";
}

function primaryLabel(state: RowActionState, t: (key: string) => string) {
  if (state.mode === "returned") {
    return state.loading
      ? t("common.admin.invoices.status.saving")
      : t("common.admin.invoices.dialog.footer.saveReturned");
  }
  if (state.mode === "refund") {
    return state.loading
      ? t("common.admin.invoices.status.processing")
      : t("common.admin.invoices.actions.refund");
  }
  if (state.mode === "withdraw") {
    return state.loading
      ? t("common.admin.invoices.status.processing")
      : t("common.admin.invoices.actions.withdraw14Days");
  }
  return state.loading
    ? t("common.admin.invoices.status.sending")
    : t("common.admin.invoices.actions.send");
}

function isDisabled(state: RowActionState) {
  if (state.loading) return true;
  if (state.mode === "dunning") return !state.canSend;
  return false;
}

export default function DialogFooter({
  state,
  onSubmitReturned,
  onSubmitDunning,
  onSubmitRefund,
  onSubmitWithdraw,
}: Props) {
  const { t } = useTranslation();
  function onSubmit() {
    if (state.mode === "returned") return onSubmitReturned();
    if (state.mode === "refund") return onSubmitRefund();
    if (state.mode === "withdraw") return onSubmitWithdraw();
    return onSubmitDunning();
  }

  return (
    <div className="dialog-footer ks-inv-dialog__footer">
      <div className="ks-inv-dialog__footerMain">
        <button
          type="button"
          className="btn"
          onClick={onSubmit}
          disabled={isDisabled(state)}
        >
          {primaryLabel(state, t)}
        </button>

        {state.notice ? (
          <span
            className={"ks-inv-dialog__notice" + noticeClass(state.noticeTone)}
            aria-live="polite"
          >
            {state.notice}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// "use client";

// import React from "react";
// import type { RowActionState } from "../../hooks/useInvoiceRowActions";

// type Props = {
//   state: RowActionState;
//   onSubmitReturned: () => void;
//   onSubmitDunning: () => void;

//   onSubmitRefund: () => void;
//   onSubmitWithdraw: () => void;
// };

// function noticeClass(tone?: string) {
//   if (tone === "success") return " is-success";
//   if (tone === "error") return " is-error";
//   return "";
// }

// function primaryLabel(state: RowActionState) {
//   if (state.mode === "returned")
//     return state.loading ? "Saving..." : "Save returned";
//   if (state.mode === "refund")
//     return state.loading ? "Processing..." : "Refund";
//   if (state.mode === "withdraw")
//     return state.loading ? "Processing..." : "Withdraw (14 days)";
//   return state.loading ? "Sending..." : "Send";
// }

// function isDisabled(state: RowActionState) {
//   if (state.loading) return true;
//   if (state.mode === "dunning") return !state.canSend;
//   return false;
// }

// export default function DialogFooter({
//   state,
//   onSubmitReturned,
//   onSubmitDunning,
//   onSubmitRefund,
//   onSubmitWithdraw,
// }: Props) {
//   function onSubmit() {
//     if (state.mode === "returned") return onSubmitReturned();
//     if (state.mode === "refund") return onSubmitRefund();
//     if (state.mode === "withdraw") return onSubmitWithdraw();
//     return onSubmitDunning();
//   }

//   return (
//     <div className="ks-inv-dialog__footer">
//       <div className="ks-inv-dialog__footerMain">
//         <button
//           type="button"
//           className="btn"
//           onClick={onSubmit}
//           disabled={isDisabled(state)}
//         >
//           {primaryLabel(state)}
//         </button>

//         {state.notice ? (
//           <span
//             className={"ks-inv-dialog__notice" + noticeClass(state.noticeTone)}
//             aria-live="polite"
//           >
//             {state.notice}
//           </span>
//         ) : null}
//       </div>
//     </div>
//   );
// }
