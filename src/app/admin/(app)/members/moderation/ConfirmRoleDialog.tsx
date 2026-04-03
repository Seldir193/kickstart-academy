"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Member } from "../types";

type Props = {
  open: boolean;
  item: Member | null;
  nextRole: "provider" | "super" | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  canEdit: boolean;
  lockedReason?: string;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function roleLabel(role?: string | null) {
  const r = clean(role).toLowerCase();
  return r === "super" ? "Superadmin" : "Provider";
}

export default function ConfirmRoleDialog({
  open,
  item,
  nextRole,
  onClose,
  onConfirm,
  canEdit,
  lockedReason,
}: Props) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
  }, [open]);

  const txt = useMemo(() => {
    if (!item || !nextRole) return null;
    const name =
      clean((item as any)?.fullName) || clean((item as any)?.email) || "Member";
    const from = roleLabel((item as any)?.role);
    const to = roleLabel(nextRole);
    return { name, from, to };
  }, [item, nextRole]);

  if (!open || !item || !nextRole || !txt) return null;

  const disabled = busy || !canEdit;

  return (
    <div
      className="dialog-backdrop members-dialog members-dialog--role"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label="Close"
        onClick={busy ? undefined : onClose}
      />

      <div className="dialog members-dialog__dialog">
        <div className="dialog-head members-dialog__head">
          <div className="members-dialog__head-main">
            <h2 className="dialog-title members-dialog__title">Change role</h2>
            <span className="badge">Confirmation</span>
          </div>

          <div className="dialog-head__actions">
            <button
              type="button"
              className="dialog-close"
              aria-label="Close"
              onClick={onClose}
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

        <div className="dialog-body members-dialog__body">
          {lockedReason && !canEdit ? (
            <div className="members-dialog__hint">{lockedReason}</div>
          ) : null}

          <section className="dialog-section members-dialog__section">
            <div className="dialog-section__head">
              <h3 className="dialog-section__title">Details</h3>
            </div>

            <div className="dialog-section__body">
              <div className="members-dialog__meta">
                <div className="members-dialog__meta-row">
                  <span className="dialog-label">Member</span>
                  <span className="dialog-value">{txt.name}</span>
                </div>

                <div className="members-dialog__meta-row">
                  <span className="dialog-label">Role</span>
                  <span className="dialog-value">
                    {txt.from} → <b>{txt.to}</b>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="members-dialog__footer">
            <button
              type="button"
              className="btn btn--danger"
              disabled={disabled}
              onClick={async () => {
                if (disabled) return;
                setBusy(true);
                try {
                  await onConfirm();
                  onClose();
                } finally {
                  setBusy(false);
                }
              }}
              title={!canEdit && lockedReason ? lockedReason : undefined}
            >
              {busy ? "Please wait..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// // //src\app\admin\(app)\members\moderation\ConfirmRoleDialog.tsx
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import type { Member } from "../types";

// type Props = {
//   open: boolean;
//   item: Member | null;
//   nextRole: "provider" | "super" | null;
//   onClose: () => void;
//   onConfirm: () => Promise<void> | void;
//   canEdit: boolean;
//   lockedReason?: string;
// };

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function roleLabel(role?: string | null) {
//   const r = clean(role).toLowerCase();
//   return r === "super" ? "Superadmin" : "Provider";
// }

// export default function ConfirmRoleDialog({
//   open,
//   item,
//   nextRole,
//   onClose,
//   onConfirm,
//   canEdit,
//   lockedReason,
// }: Props) {
//   const [busy, setBusy] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     setBusy(false);
//   }, [open]);

//   const txt = useMemo(() => {
//     if (!item || !nextRole) return null;
//     const name =
//       clean((item as any)?.fullName) || clean((item as any)?.email) || "Member";
//     const from = roleLabel((item as any)?.role);
//     const to = roleLabel(nextRole);
//     return { name, from, to };
//   }, [item, nextRole]);

//   if (!open || !item || !nextRole || !txt) return null;

//   const disabled = busy || !canEdit;

//   return (
//     <div className="ks-modal-root" role="dialog" aria-modal="true">
//       <div className="ks-backdrop" onClick={busy ? undefined : onClose} />

//       <div
//         className="ks-panel card members-dialog members-dialog--role"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="members-dialog__head">
//           <div className="members-dialog__head-left">
//             <h2 className="members-dialog__title">Change role</h2>
//             <span className="badge">Confirmation</span>
//           </div>

//           <div className="members-dialog__head-actions">
//             <button
//               type="button"
//               className="modal__close"
//               aria-label="Close"
//               onClick={onClose}
//               aria-disabled={busy}
//             >
//               <img
//                 src="/icons/close.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="icon-img"
//               />
//             </button>
//           </div>
//         </div>

//         {lockedReason && !canEdit ? (
//           <div className="members-dialog__hint">{lockedReason}</div>
//         ) : null}

//         <div className="members-dialog__body">
//           <div className="members-dialog__meta">
//             <div className="members-dialog__meta-row">
//               <span className="members-dialog__meta-key">Member</span>
//               <span className="members-dialog__meta-val">{txt.name}</span>
//             </div>

//             <div className="members-dialog__meta-row">
//               <span className="members-dialog__meta-key">Role</span>
//               <span className="members-dialog__meta-val">
//                 {txt.from} → <b>{txt.to}</b>
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="members-dialog__footer">
//           <button
//             type="button"
//             className="btn btn--danger"
//             disabled={disabled}
//             onClick={async () => {
//               if (disabled) return;
//               setBusy(true);
//               try {
//                 await onConfirm();
//                 onClose();
//               } finally {
//                 setBusy(false);
//               }
//             }}
//             title={!canEdit && lockedReason ? lockedReason : undefined}
//           >
//             {busy ? "Please wait..." : "Confirm"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
