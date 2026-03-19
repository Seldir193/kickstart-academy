// src/app/admin/(app)/coaches/moderation/RejectDialog.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void> | void;
};

export default function RejectDialog({ open, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setErr(null);
    setBusy(false);
  }, [open]);

  if (!open) return null;

  async function submit() {
    const r = reason.trim();
    if (!r) {
      setErr("Bitte eine Begründung eingeben.");
      return;
    }

    setErr(null);
    try {
      setBusy(true);
      await onSubmit(r);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Ablehnen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 6000,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 640 }}>
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="text-xl font-bold">Coach ablehnen</div>

          <button
            type="button"
            className="modal__close"
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

        {err ? <div className="error mb-3">{err}</div> : null}

        <label className="block text-sm text-gray-600 mb-1">Begründung *</label>

        <textarea
          className="input"
          style={{ minHeight: 110 }}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="z.B. Daten unvollständig / nicht plausibel / doppelt…"
        />

        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={busy}
          >
            Abbrechen
          </button>

          <button
            type="button"
            className="btn btn--danger"
            onClick={submit}
            disabled={busy}
          >
            {busy ? "…" : "Ablehnen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// // src/app/admin/coaches/moderation/RejectDialog.tsx
// "use client";

// import React, { useEffect, useState } from "react";

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (reason: string) => Promise<void>;
// };

// export default function RejectDialog({ open, onClose, onSubmit }: Props) {
//   const [reason, setReason] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   useEffect(() => {
//     if (!open) return;
//     setReason("");
//     setErr(null);
//     setBusy(false);
//   }, [open]);

//   if (!open) return null;

//   async function submit() {
//     const r = reason.trim();
//     if (!r) {
//       setErr("Bitte eine Begründung eingeben.");
//       return;
//     }
//     setErr(null);
//     try {
//       setBusy(true);
//       await onSubmit(r);
//       onClose();
//     } catch (e: any) {
//       setErr(e?.message || "Reject fehlgeschlagen.");
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
//           <div className="text-xl font-bold">Coach ablehnen</div>
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

//         <label className="block text-sm text-gray-600 mb-1">Begründung *</label>
//         <textarea
//           className="input"
//           style={{ minHeight: 110 }}
//           value={reason}
//           onChange={(e) => setReason(e.target.value)}
//           placeholder="z.B. Daten unvollständig / nicht plausibel / doppelt…"
//         />

//         <div className="flex gap-2 justify-end mt-4">
//           <button className="btn" onClick={onClose} disabled={busy}>
//             Abbrechen
//           </button>
//           <button className="btn btn--danger" onClick={submit} disabled={busy}>
//             {busy ? "Reject…" : "Reject"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
