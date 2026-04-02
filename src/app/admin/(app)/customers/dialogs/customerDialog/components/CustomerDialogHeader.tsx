"use client";

import React from "react";
import type { Customer } from "../../../types";
import type { FamilyCreateMode } from "../types";

type Props = {
  form: Customer;
  mode: "create" | "edit";
  isActive: boolean;
  familyCreateMode: FamilyCreateMode;
  setDocumentsOpen: (v: boolean) => void;
  setBookOpen: (v: boolean) => void;
  setCancelOpen: (v: boolean) => void;
  setStornoOpen: (v: boolean) => void;
  onClose: () => void;
};

export default function CustomerDialogHeader(p: Props) {
  return (
    <div className="dialog-head ks-customer-dialog__head">
      <div className="ks-customer-dialog__head-left">
        <h2 className="dialog-title ks-customer-dialog__title">
          Customer #{(p.form as any).userId ?? "—"}
        </h2>

        <div className="ks-customer-dialog__head-meta">
          <span className={`badge ${p.isActive ? "" : "badge-muted"}`}>
            {p.isActive ? "Active" : "Cancelled"}
          </span>

          {p.mode === "edit" && p.familyCreateMode !== "none" ? (
            <span className="badge badge-info">
              {p.familyCreateMode === "newChild"
                ? "New child will be created"
                : ""}
            </span>
          ) : null}
        </div>
      </div>

      <div className="ks-customer-dialog__head-right">
        <div className="dialog-head__actions ks-customer-dialog__actions">
          <button
            className="btn"
            onClick={() => p.setDocumentsOpen(true)}
            disabled={!p.form._id}
            type="button"
          >
            Documents
          </button>

          <button
            className="btn"
            onClick={() => p.setBookOpen(true)}
            disabled={!p.form._id}
            type="button"
          >
            Book
          </button>

          <button
            className="btn"
            onClick={() => p.setCancelOpen(true)}
            disabled={!p.form._id}
            type="button"
          >
            Cancel
          </button>

          <button
            className="btn"
            onClick={() => p.setStornoOpen(true)}
            disabled={!p.form._id}
            type="button"
          >
            Credit note
          </button>
        </div>

        <div className="ks-customer-dialog__close-wrap">
          <button
            type="button"
            className="dialog-close modal__close ks-customer-dialog__close"
            aria-label="Close"
            onClick={p.onClose}
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
    </div>
  );
}

// "use client";

// import React from "react";
// import type { Customer } from "../../../types";
// import type { FamilyCreateMode } from "../types";

// type Props = {
//   form: Customer;
//   mode: "create" | "edit";
//   isActive: boolean;
//   familyCreateMode: FamilyCreateMode;
//   setDocumentsOpen: (v: boolean) => void;
//   setBookOpen: (v: boolean) => void;
//   setCancelOpen: (v: boolean) => void;
//   setStornoOpen: (v: boolean) => void;
//   onClose: () => void;
// };

// export default function CustomerDialogHeader(p: Props) {
//   return (
//     <div className="dialog-head ks-customer-dialog__head">
//       <div className="ks-customer-dialog__head-left">
//         <h2 className="dialog-title ks-customer-dialog__title">
//           Customer #{(p.form as any).userId ?? "—"}
//         </h2>

//         <div className="ks-customer-dialog__head-meta">
//           <span className={`badge ${p.isActive ? "" : "badge-muted"}`}>
//             {p.isActive ? "Active" : "Cancelled"}
//           </span>

//           {p.mode === "edit" && p.familyCreateMode !== "none" ? (
//             <span className="badge badge-info">
//               {p.familyCreateMode === "newChild"
//                 ? "New child will be created"
//                 : ""}
//             </span>
//           ) : null}
//         </div>
//       </div>

//       <div className="ks-customer-dialog__head-right">
//         <div className="dialog-head__actions ks-customer-dialog__actions">
//           <button
//             className="btn"
//             onClick={() => p.setDocumentsOpen(true)}
//             disabled={!p.form._id}
//             type="button"
//           >
//             Documents
//           </button>

//           <button
//             className="btn"
//             onClick={() => p.setBookOpen(true)}
//             disabled={!p.form._id}
//             type="button"
//           >
//             Book
//           </button>

//           <button
//             className="btn"
//             onClick={() => p.setCancelOpen(true)}
//             disabled={!p.form._id}
//             type="button"
//           >
//             Cancel
//           </button>

//           <button
//             className="btn"
//             onClick={() => p.setStornoOpen(true)}
//             disabled={!p.form._id}
//             type="button"
//           >
//             Credit note
//           </button>

//           <button
//             type="button"
//             className="dialog-close modal__close ks-customer-dialog__close"
//             aria-label="Close"
//             onClick={p.onClose}
//           >
//             <img
//               src="/icons/close.svg"
//               alt=""
//               aria-hidden="true"
//               className="icon-img"
//             />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import React from "react";
// import type { Customer } from "../../../types";
// import type { FamilyCreateMode } from "../types";

// type Props = {
//   form: Customer;
//   mode: "create" | "edit";
//   isActive: boolean;
//   familyCreateMode: FamilyCreateMode;
//   setDocumentsOpen: (v: boolean) => void;
//   setBookOpen: (v: boolean) => void;
//   setCancelOpen: (v: boolean) => void;
//   setStornoOpen: (v: boolean) => void;
// };

// export default function CustomerDialogHeader(p: Props) {
//   return (
//     <div className="dialog-head ks-customer-dialog__head">
//       <div className="ks-customer-dialog__head-left">
//         <h2 className="dialog-title ks-customer-dialog__title">
//           Customer #{(p.form as any).userId ?? "—"}
//         </h2>

//         <div className="ks-customer-dialog__head-meta">
//           <span className={`badge ${p.isActive ? "" : "badge-muted"}`}>
//             {p.isActive ? "Active" : "Cancelled"}
//           </span>

//           {p.mode === "edit" && p.familyCreateMode !== "none" ? (
//             <span className="badge badge-info">
//               {p.familyCreateMode === "newChild"
//                 ? "New child will be created"
//                 : ""}
//             </span>
//           ) : null}
//         </div>
//       </div>

//       <div className="ks-customer-dialog__head-right">
//         <div className="dialog-head__actions ks-customer-dialog__actions">
//           <button
//             className="btn"
//             onClick={() => p.setDocumentsOpen(true)}
//             disabled={!p.form._id}
//             type="button"
//           >
//             Documents
//           </button>

//           <button
//             className="btn"
//             onClick={() => p.setBookOpen(true)}
//             disabled={!p.form._id}
//             type="button"
//           >
//             Book
//           </button>

//           <button
//             className="btn"
//             onClick={() => p.setCancelOpen(true)}
//             disabled={!p.form._id}
//             type="button"
//           >
//             Cancel
//           </button>

//           <button
//             className="btn"
//             onClick={() => p.setStornoOpen(true)}
//             disabled={!p.form._id}
//             type="button"
//           >
//             Credit note
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// //src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerDialogHeader.tsx
// "use client";

// import React from "react";
// import type { Customer } from "../../../types";
// import type { FamilyCreateMode } from "../types";

// type Props = {
//   form: Customer;
//   mode: "create" | "edit";
//   isActive: boolean;
//   familyCreateMode: FamilyCreateMode;
//   setDocumentsOpen: (v: boolean) => void;
//   setBookOpen: (v: boolean) => void;
//   setCancelOpen: (v: boolean) => void;
//   setStornoOpen: (v: boolean) => void;
// };

// export default function CustomerDialogHeader(p: Props) {
//   return (
//     <div className="dialog-head">
//       <div className="dialog-head__left">
//         <h2 className="text-xl font-bold">
//           Customer #{(p.form as any).userId ?? "—"}
//         </h2>
//         <span className={`badge ${p.isActive ? "" : "badge-muted"}`}>
//           {p.isActive ? "Active" : "Cancelled"}
//         </span>
//         {p.mode === "edit" && p.familyCreateMode !== "none" && (
//           <span className="badge badge-info ml-2">
//             {p.familyCreateMode === "newChild"
//               ? "Neues Kind wird angelegt"
//               : ""}
//           </span>
//         )}
//       </div>

//       <div className="dialog-head__actions">
//         <button
//           className="btn"
//           onClick={() => p.setDocumentsOpen(true)}
//           disabled={!p.form._id}
//         >
//           Documents
//         </button>
//         <button
//           className="btn"
//           onClick={() => p.setBookOpen(true)}
//           disabled={!p.form._id}
//         >
//           Book
//         </button>
//         <button
//           className="btn"
//           onClick={() => p.setCancelOpen(true)}
//           disabled={!p.form._id}
//         >
//           Cancel
//         </button>
//         <button
//           className="btn"
//           onClick={() => p.setStornoOpen(true)}
//           disabled={!p.form._id}
//         >
//           Credit note
//         </button>
//       </div>
//     </div>
//   );
// }
