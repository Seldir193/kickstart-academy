"use client";

import React from "react";

type Props = {
  mode: "create" | "edit";
  saving: boolean;
  onClose: () => void;
  onCreate: () => void;
  onSave: () => void;
};

export default function CustomerDialogFooter(p: Props) {
  return (
    <div className="dialog-footer ks-customer-dialog__footer">
      {p.mode === "create" ? (
        <button
          className="btn"
          onClick={p.onCreate}
          disabled={p.saving}
          type="button"
        >
          {p.saving ? "Creating…" : "Create"}
        </button>
      ) : (
        <button
          className="btn"
          onClick={p.onSave}
          disabled={p.saving}
          type="button"
        >
          {p.saving ? "Saving…" : "Save changes"}
        </button>
      )}
    </div>
  );
}

// "use client";

// import React from "react";

// type Props = {
//   mode: "create" | "edit";
//   saving: boolean;
//   onClose: () => void;
//   onCreate: () => void;
//   onSave: () => void;
// };

// export default function CustomerDialogFooter(p: Props) {
//   return (
//     <div className="dialog-footer ks-customer-dialog__footer">
//       <button
//         type="button"
//         className="btn"
//         onClick={p.onClose}
//         disabled={p.saving}
//       >
//         Cancel
//       </button>

//       {p.mode === "create" ? (
//         <button
//           className="btn"
//           onClick={p.onCreate}
//           disabled={p.saving}
//           type="button"
//         >
//           {p.saving ? "Creating…" : "Create"}
//         </button>
//       ) : (
//         <button
//           className="btn"
//           onClick={p.onSave}
//           disabled={p.saving}
//           type="button"
//         >
//           {p.saving ? "Saving…" : "Save changes"}
//         </button>
//       )}
//     </div>
//   );
// }

// //src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerDialogFooter.tsx
// "use client";

// import React from "react";

// type Props = {
//   mode: "create" | "edit";
//   saving: boolean;
//   onClose: () => void;
//   onCreate: () => void;
//   onSave: () => void;
// };

// export default function CustomerDialogFooter(p: Props) {
//   return (
//     <div className="flex flex-wrap gap-2 justify-end mt-3">
//       <button
//         type="button"
//         className="modal__close"
//         aria-label="Close"
//         onClick={p.onClose}
//       >
//         <img
//           src="/icons/close.svg"
//           alt=""
//           aria-hidden="true"
//           className="icon-img"
//         />
//       </button>

//       {p.mode === "create" ? (
//         <button
//           className="btn"
//           onClick={p.onCreate}
//           disabled={p.saving}
//           type="button"
//         >
//           {p.saving ? "Creating…" : "Create"}
//         </button>
//       ) : (
//         <button
//           className="btn"
//           onClick={p.onSave}
//           disabled={p.saving}
//           type="button"
//         >
//           {p.saving ? "Saving…" : "Save changes"}
//         </button>
//       )}
//     </div>
//   );
// }
