"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { InvoiceRow } from "../../utils/invoiceList";
import { docRefFromRow, dialogTitle } from "./dialogLogic";
import type { RowActionState } from "../../hooks/useInvoiceRowActions";

type Props = {
  state: RowActionState;
  row: InvoiceRow;
  onClose: () => void;
};

export default function DialogHeader({ state, row, onClose }: Props) {
  const { t } = useTranslation();
  const docRef = docRefFromRow(row);

  return (
    <div className="dialog-head ks-inv-dialog__head">
      <div className="ks-inv-dialog__headText">
        <div className="dialog-title ks-inv-dialog__title">
          {dialogTitle(state, t)}
        </div>
        <div className="dialog-subtitle ks-inv-dialog__meta">
          {row.title || t("common.admin.invoices.docType.document")} ·{" "}
          {row.customerName || "-"}
        </div>
        <div className="dialog-subtitle ks-inv-dialog__meta">{docRef}</div>
      </div>

      <div className="dialog-head__actions">
        <button
          type="button"
          className="dialog-close modal__close"
          onClick={onClose}
          aria-label={t("common.actions.close")}
          title={t("common.actions.close")}
        >
          <img
            src="/icons/close.svg"
            alt=""
            aria-hidden="true"
            className="icon-img"
          />
        </button>
      </div>
    </div>
  );
}

// "use client";

// import React from "react";
// import type { InvoiceRow } from "../../utils/invoiceList";
// import { docRefFromRow, dialogTitle } from "./dialogLogic";
// import type { RowActionState } from "../../hooks/useInvoiceRowActions";

// type Props = {
//   state: RowActionState;
//   row: InvoiceRow;
//   onClose: () => void;
// };

// export default function DialogHeader({ state, row, onClose }: Props) {
//   const docRef = docRefFromRow(row);

//   return (
//     <div className="ks-inv-dialog__head">
//       <div className="ks-inv-dialog__headText">
//         <div className="ks-inv-dialog__title">{dialogTitle(state)}</div>
//         <div className="ks-inv-dialog__meta">
//           {row.title || "Dokument"} · {row.customerName || "-"}
//         </div>
//         <div className="ks-inv-dialog__meta">{docRef}</div>
//       </div>

//       <div className="dialog-head__actions">
//         <button
//           type="button"
//           className="modal__close"
//           onClick={onClose}
//           aria-label="Close"
//           title="Close"
//         >
//           <img
//             src="/icons/close.svg"
//             alt=""
//             aria-hidden="true"
//             className="icon-img"
//           />
//         </button>
//       </div>
//     </div>
//   );
// }
