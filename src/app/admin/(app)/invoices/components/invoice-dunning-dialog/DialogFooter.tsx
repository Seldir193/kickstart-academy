"use client";

import React from "react";
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

function primaryLabel(state: RowActionState) {
  if (state.mode === "returned")
    return state.loading ? "Saving..." : "Save returned";
  if (state.mode === "refund")
    return state.loading ? "Processing..." : "Refund";
  if (state.mode === "withdraw")
    return state.loading ? "Processing..." : "Withdraw (14 days)";
  return state.loading ? "Sending..." : "Send";
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
  function onSubmit() {
    if (state.mode === "returned") return onSubmitReturned();
    if (state.mode === "refund") return onSubmitRefund();
    if (state.mode === "withdraw") return onSubmitWithdraw();
    return onSubmitDunning();
  }

  return (
    <div className="ks-inv-dialog__footer">
      <div className="ks-inv-dialog__footerMain">
        <button
          type="button"
          className="btn"
          onClick={onSubmit}
          disabled={isDisabled(state)}
        >
          {primaryLabel(state)}
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

// //src\app\admin\(app)\invoices\components\invoice-dunning-dialog\DialogFooter.tsx
// "use client";

// import React from "react";
// import type { RowActionState } from "../../hooks/useInvoiceRowActions";

// type Props = {
//   state: RowActionState;
//   onSubmitReturned: () => void;
//   onSubmitDunning: () => void;
// };

// function noticeClass(tone?: string) {
//   if (tone === "success") return " is-success";
//   if (tone === "error") return " is-error";
//   return "";
// }

// export default function DialogFooter({
//   state,
//   onSubmitReturned,
//   onSubmitDunning,
// }: Props) {
//   return (
//     <div className="ks-inv-dialog__footer">
//       <div className="ks-inv-dialog__footerMain">
//         {state.mode === "returned" ? (
//           <button
//             type="button"
//             className="btn"
//             onClick={onSubmitReturned}
//             disabled={state.loading}
//           >
//             {state.loading ? "Saving..." : "Save returned"}
//           </button>
//         ) : (
//           <button
//             type="button"
//             className="btn"
//             onClick={onSubmitDunning}
//             disabled={state.loading || !state.canSend}
//           >
//             {state.loading ? "Sending..." : "Send"}
//           </button>
//         )}

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
