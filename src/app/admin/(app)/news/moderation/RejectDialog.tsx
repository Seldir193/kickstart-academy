//src\app\admin\(app)\news\moderation\RejectDialog.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  readOnly?: boolean;
  initialReason?: string;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function isBackdrop(e: React.MouseEvent<HTMLDivElement>) {
  return e.target === e.currentTarget;
}

export default function RejectDialog({
  open,
  title,
  onClose,
  onSubmit,
  readOnly,
  initialReason,
}: Props) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = useMemo(() => {
    const t = clean(title);
    return t ? `Reject: ${t}` : "Reject item";
  }, [title]);

  useEffect(() => {
    if (!open) return;
    setReason(clean(initialReason));
    setError(null);
    setBusy(false);
  }, [open, initialReason]);

  async function submit() {
    const r = clean(reason);
    if (!r) return setError("Please enter a reason.");
    setError(null);
    setBusy(true);
    try {
      await onSubmit(r);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Reject failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (!busy && isBackdrop(e)) onClose();
      }}
    >
      <div className="modal__overlay" />

      <div className="modal__panel modal__panel--md">
        <div className="card">
          <div className="dialog-head">
            <div className="dialog-head__left">
              <h2 className="text-xl font-bold m-0">{heading}</h2>
              <span className="badge">Reject</span>
            </div>

            <div className="dialog-head__actions">
              <button
                type="button"
                className="modal__close"
                aria-label="Close"
                onClick={() => {
                  if (!busy) onClose();
                }}
                aria-disabled={busy}
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

          {error ? <div className="error mb-3">{error}</div> : null}

          <div className="field">
            <label className="lbl">Reason *</label>
            <textarea
              className="input"
              style={{ minHeight: 120 }}
              value={reason}
              readOnly={!!readOnly}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. missing data / not plausible / duplicate..."
            />
          </div>

          <div className="news-dialog__footer">
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (!busy) onClose();
              }}
              aria-disabled={busy}
            >
              {readOnly ? "Close" : "Cancel"}
            </button>

            {!readOnly ? (
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  if (!busy) submit();
                }}
                aria-disabled={busy}
              >
                {busy ? "Rejecting..." : "Reject"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import React, { useEffect, useMemo, useState } from "react";

// type Props = {
//   open: boolean;
//   title?: string;
//   onClose: () => void;
//   onSubmit: (reason: string) => Promise<void>;
// };

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function isBackdrop(e: React.MouseEvent<HTMLDivElement>) {
//   return e.target === e.currentTarget;
// }

// export default function RejectDialog({
//   open,
//   title,
//   onClose,
//   onSubmit,
// }: Props) {
//   const [reason, setReason] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const heading = useMemo(() => {
//     const t = clean(title);
//     return t ? `Reject: ${t}` : "Reject item";
//   }, [title]);

//   useEffect(() => {
//     if (!open) return;
//     setReason("");
//     setError(null);
//     setBusy(false);
//   }, [open]);

//   async function submit() {
//     const r = clean(reason);
//     if (!r) return setError("Please enter a reason.");
//     setError(null);
//     setBusy(true);
//     try {
//       await onSubmit(r);
//       onClose();
//     } catch (e: any) {
//       setError(e?.message || "Reject failed.");
//     } finally {
//       setBusy(false);
//     }
//   }

//   if (!open) return null;

//   return (
//     <div
//       className="modal"
//       role="dialog"
//       aria-modal="true"
//       onMouseDown={(e) => {
//         if (!busy && isBackdrop(e)) onClose();
//       }}
//     >
//       <div className="modal__overlay" />

//       <div className="modal__panel modal__panel--md">
//         <div className="card">
//           <div className="dialog-head">
//             <div className="dialog-head__left">
//               <h2 className="text-xl font-bold m-0">{heading}</h2>
//               <span className="badge">Reject</span>
//             </div>

//             <div className="dialog-head__actions">
//               <button
//                 type="button"
//                 className="modal__close"
//                 aria-label="Close"
//                 onClick={() => {
//                   if (!busy) onClose();
//                 }}
//                 aria-disabled={busy}
//               >
//                 <img
//                   src="/icons/close.svg"
//                   alt=""
//                   aria-hidden="true"
//                   className="icon-img"
//                 />
//               </button>
//             </div>
//           </div>

//           {error ? <div className="error mb-3">{error}</div> : null}

//           <div className="field">
//             <label className="lbl">Reason *</label>
//             <textarea
//               className="input"
//               style={{ minHeight: 120 }}
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="e.g. missing data / not plausible / duplicate..."
//             />
//           </div>

//           <div className="news-dialog__footer">
//             <button
//               type="button"
//               className="btn"
//               onClick={() => {
//                 if (!busy) onClose();
//               }}
//               aria-disabled={busy}
//             >
//               Cancel
//             </button>

//             <button
//               type="button"
//               className="btn btn--danger"
//               onClick={() => {
//                 if (!busy) submit();
//               }}
//               aria-disabled={busy}
//             >
//               {busy ? "Rejecting..." : "Reject"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
