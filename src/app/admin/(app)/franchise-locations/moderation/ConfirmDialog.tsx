"use client";

import React, { useEffect, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDialog({
  open,
  title,
  text,
  confirmText = "Bestätigen",
  cancelText = "Abbrechen",
  danger = false,
  onClose,
  onConfirm,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setErr(null);
  }, [open]);

  if (!open) return null;

  async function confirm() {
    setErr(null);
    try {
      setBusy(true);
      await onConfirm();
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Aktion fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="dialog-backdrop fl-confirm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog fl-confirm__dialog">
        <div className="dialog-head fl-confirm__head">
          <div className="fl-confirm__head-left">
            <div className="dialog-title fl-confirm__title">{title}</div>
          </div>

          <div className="fl-confirm__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label="Close"
                onClick={onClose}
                disabled={busy}
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

        <div className="dialog-body fl-confirm__body">
          {err ? <div className="error fl-confirm__error">{err}</div> : null}

          <div className="dialog-value fl-confirm__text">{text}</div>
        </div>

        <div className="dialog-footer fl-confirm__footer">
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={busy}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={danger ? "btn btn--danger" : "btn"}
            onClick={confirm}
            disabled={busy}
          >
            {busy ? "…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// // src/app/admin/franchise-locations/moderation/ConfirmDialog.tsx
// "use client";

// import React, { useEffect, useState } from "react";

// type Props = {
//   open: boolean;
//   title: string;
//   text: string;
//   confirmText?: string;
//   cancelText?: string;
//   danger?: boolean;
//   onClose: () => void;
//   onConfirm: () => Promise<void> | void;
// };

// export default function ConfirmDialog({
//   open,
//   title,
//   text,
//   confirmText = "Bestätigen",
//   cancelText = "Abbrechen",
//   danger = false,
//   onClose,
//   onConfirm,
// }: Props) {
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   useEffect(() => {
//     if (!open) return;
//     setBusy(false);
//     setErr(null);
//   }, [open]);

//   if (!open) return null;

//   async function confirm() {
//     setErr(null);
//     try {
//       setBusy(true);
//       await onConfirm();
//       onClose();
//     } catch (e: any) {
//       setErr(e?.message || "Aktion fehlgeschlagen.");
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div
//       role="dialog"
//       aria-modal="true"
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 6000,
//         background: "rgba(0,0,0,.45)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: 16,
//       }}
//       onMouseDown={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div className="card" style={{ width: "100%", maxWidth: 640 }}>
//         <div className="flex justify-between items-start gap-3 mb-3">
//           <div className="text-xl font-bold">{title}</div>
//           <button
//             type="button"
//             className="modal__close"
//             aria-label="Close"
//             onClick={onClose}
//             disabled={busy}
//           >
//             <img
//               src="/icons/close.svg"
//               alt=""
//               aria-hidden="true"
//               className="icon-img"
//             />
//           </button>
//         </div>

//         {err && <div className="error mb-3">{err}</div>}

//         <div className="text-sm text-gray-700">{text}</div>

//         <div className="flex gap-2 justify-end mt-4">
//           <button className="btn" onClick={onClose} disabled={busy}>
//             {cancelText}
//           </button>
//           <button
//             className={danger ? "btn btn--danger" : "btn"}
//             onClick={confirm}
//             disabled={busy}
//           >
//             {busy ? "…" : confirmText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
