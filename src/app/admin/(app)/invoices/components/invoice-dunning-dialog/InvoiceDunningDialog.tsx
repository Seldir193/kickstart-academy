//src\app\admin\(app)\invoices\components\invoice-dunning-dialog\InvoiceDunningDialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import type { InvoiceRow } from "../../utils/invoiceList";
import type { RowActionState } from "../../hooks/useInvoiceRowActions";
import { dialogAriaLabel } from "./dialogLogic";
import DialogHeader from "./DialogHeader";
import StageSelectField from "./StageSelectField";
import ReturnedFields from "./ReturnedFields";
import DunningFields from "./DunningFields";
import DialogFooter from "./DialogFooter";

type Props = {
  state: RowActionState;
  setState: React.Dispatch<React.SetStateAction<RowActionState>>;
  onClose: () => void;
  onSubmitReturned: () => void;
  onSubmitDunning: () => void;

  onSubmitRefund: () => void;
  onSubmitWithdraw: () => void;
};

function isRefundMode(mode: any) {
  return mode === "refund" || mode === "withdraw";
}

export default function InvoiceDunningDialog(props: Props) {
  const [stageOpen, setStageOpen] = useState(false);

  useEffect(() => {
    if (!props.state.open) setStageOpen(false);
  }, [props.state.open]);

  if (!props.state.open || !props.state.row) return null;

  const row = props.state.row as InvoiceRow;
  const inputsDisabled = props.state.loading || props.state.inputsDisabled;
  const refundMode = isRefundMode(props.state.mode);

  return (
    <div className="ks-inv-dialog" onClick={props.onClose}>
      <div
        className="ks-inv-dialog__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={dialogAriaLabel(props.state)}
      >
        <DialogHeader state={props.state} row={row} onClose={props.onClose} />

        <div className="ks-inv-dialog__body">
          {props.state.mode === "dunning" ? (
            <StageSelectField
              row={row}
              state={props.state}
              setState={props.setState}
              stageOpen={stageOpen}
              setStageOpen={setStageOpen}
            />
          ) : null}

          {!refundMode ? (
            <>
              <label className="ks-inv-dialog__field">
                <span className="ks-inv-dialog__label">
                  Rücklastschriftgebühr
                </span>
                <input
                  className="input"
                  type="text"
                  inputMode="decimal"
                  value={props.state.bankFee}
                  onChange={(e) =>
                    props.setState((p) => ({ ...p, bankFee: e.target.value }))
                  }
                  placeholder="z. B. 16,76"
                  disabled={inputsDisabled}
                />
              </label>

              <ReturnedFields
                state={props.state}
                setState={props.setState}
                inputsDisabled={inputsDisabled}
              />
              <DunningFields
                state={props.state}
                setState={props.setState}
                inputsDisabled={inputsDisabled}
              />
            </>
          ) : (
            <label className="ks-inv-dialog__field">
              <span className="ks-inv-dialog__label">Grund (optional)</span>
              <textarea
                className="input"
                value={props.state.reason || ""}
                onChange={(e) =>
                  props.setState((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="z. B. Widerruf innerhalb 14 Tage / Refund auf Kundenwunsch"
                disabled={props.state.loading}
                rows={3}
              />
            </label>
          )}

          {props.state.error ? (
            <div className="ks-inv-dialog__error">{props.state.error}</div>
          ) : null}
        </div>

        <DialogFooter
          state={props.state}
          onSubmitReturned={props.onSubmitReturned}
          onSubmitDunning={props.onSubmitDunning}
          onSubmitRefund={props.onSubmitRefund}
          onSubmitWithdraw={props.onSubmitWithdraw}
        />
      </div>
    </div>
  );
}

// //src\app\admin\(app)\invoices\components\invoice-dunning-dialog\InvoiceDunningDialog.tsx

// "use client";

// import React, { useEffect, useState } from "react";
// import type { InvoiceRow } from "../../utils/invoiceList";
// import type { RowActionState } from "../../hooks/useInvoiceRowActions";
// import { dialogAriaLabel } from "./dialogLogic";
// import DialogHeader from "./DialogHeader";
// import StageSelectField from "./StageSelectField";
// import ReturnedFields from "./ReturnedFields";
// import DunningFields from "./DunningFields";
// import DialogFooter from "./DialogFooter";

// type Props = {
//   state: RowActionState;
//   setState: React.Dispatch<React.SetStateAction<RowActionState>>;
//   onClose: () => void;
//   onSubmitReturned: () => void;
//   onSubmitDunning: () => void;
// };

// export default function InvoiceDunningDialog(props: Props) {
//   const [stageOpen, setStageOpen] = useState(false);

//   useEffect(() => {
//     if (!props.state.open) setStageOpen(false);
//   }, [props.state.open]);

//   if (!props.state.open || !props.state.row) return null;

//   const row = props.state.row as InvoiceRow;
//   const inputsDisabled = props.state.loading || props.state.inputsDisabled;

//   return (
//     <div className="ks-inv-dialog" onClick={props.onClose}>
//       <div
//         className="ks-inv-dialog__panel"
//         onClick={(e) => e.stopPropagation()}
//         role="dialog"
//         aria-modal="true"
//         aria-label={dialogAriaLabel(props.state)}
//       >
//         <DialogHeader state={props.state} row={row} onClose={props.onClose} />

//         <div className="ks-inv-dialog__body">
//           {props.state.mode === "dunning" ? (
//             <StageSelectField
//               row={row}
//               state={props.state}
//               setState={props.setState}
//               stageOpen={stageOpen}
//               setStageOpen={setStageOpen}
//             />
//           ) : null}

//           <label className="ks-inv-dialog__field">
//             <span className="ks-inv-dialog__label">Rücklastschriftgebühr</span>
//             <input
//               className="input"
//               type="text"
//               inputMode="decimal"
//               value={props.state.bankFee}
//               onChange={(e) =>
//                 props.setState((p) => ({ ...p, bankFee: e.target.value }))
//               }
//               placeholder="z. B. 16,76"
//               disabled={inputsDisabled}
//             />
//           </label>

//           <ReturnedFields
//             state={props.state}
//             setState={props.setState}
//             inputsDisabled={inputsDisabled}
//           />
//           <DunningFields
//             state={props.state}
//             setState={props.setState}
//             inputsDisabled={inputsDisabled}
//           />

//           {props.state.error ? (
//             <div className="ks-inv-dialog__error">{props.state.error}</div>
//           ) : null}
//         </div>

//         <DialogFooter
//           state={props.state}
//           onSubmitReturned={props.onSubmitReturned}
//           onSubmitDunning={props.onSubmitDunning}
//         />
//       </div>
//     </div>
//   );
// }
