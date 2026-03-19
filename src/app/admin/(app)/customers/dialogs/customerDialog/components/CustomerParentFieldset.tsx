//src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerParentFieldset.tsx
"use client";

import React from "react";
import type { Customer } from "../../../types";
import { fetchCustomerById, toggleNewsletter } from "../api";

type Props = {
  form: Customer;
  up: (path: string, value: any) => void;
  mode: "create" | "edit";
  saving: boolean;
  newsletterBusy: boolean;
  setNewsletterBusy: (v: boolean) => void;
  setForm: (v: any) => void;
  setErr: (v: string | null) => void;
  salutationOpen: boolean;
  setSalutationOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  salutationDropdownRef: React.RefObject<HTMLDivElement | null>;
  mk: any;
  statusLabel: (s?: string) => string;
  fmtDE: (dt: any) => string;
};

export default function CustomerParentFieldset(p: Props) {
  const anyForm = p.form as any;

  // const emailValue =
  //   p.form.parent?.email || anyForm?.email || anyForm?.emailLower || "";

  const emailValue = p.form.parent?.email || "";

  return (
    <fieldset className="card">
      <legend className="font-bold">Elternteil</legend>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="lbl">Salutation</label>

          <div
            className={
              "ks-selectbox" + (p.salutationOpen ? " ks-selectbox--open" : "")
            }
            ref={p.salutationDropdownRef}
          >
            <button
              type="button"
              className="ks-selectbox__trigger"
              onClick={() => p.setSalutationOpen((o) => !o)}
            >
              <span className="ks-selectbox__label">
                {p.form.parent?.salutation || "—"}
              </span>
              <span className="ks-selectbox__chevron" aria-hidden="true" />
            </button>

            {p.salutationOpen && (
              <div className="ks-selectbox__panel">
                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (!p.form.parent?.salutation
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("parent.salutation", "");
                    p.setSalutationOpen(false);
                  }}
                >
                  —
                </button>

                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (p.form.parent?.salutation === "Frau"
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("parent.salutation", "Frau");
                    p.setSalutationOpen(false);
                  }}
                >
                  Frau
                </button>

                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (p.form.parent?.salutation === "Herr"
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("parent.salutation", "Herr");
                    p.setSalutationOpen(false);
                  }}
                >
                  Herr
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="lbl">Vorname</label>
          <input
            className="input"
            value={p.form.parent?.firstName || ""}
            onChange={(e) => p.up("parent.firstName", e.target.value)}
          />
        </div>

        <div>
          <label className="lbl">Nachname</label>
          <input
            className="input"
            value={p.form.parent?.lastName || ""}
            onChange={(e) => p.up("parent.lastName", e.target.value)}
          />
        </div>

        <div>
          <label className="lbl">E-Mail</label>
          <input
            className="input"
            type="email"
            value={emailValue}
            onChange={(e) => onEmailChange(p, e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="lbl">Telefon</label>
          <input
            className="input"
            value={p.form.parent?.phone || ""}
            onChange={(e) => p.up("parent.phone", e.target.value)}
          />
        </div>

        <div>
          <label className="lbl">Telefon 2</label>
          <input
            className="input"
            value={p.form.parent?.phone2 || ""}
            onChange={(e) => p.up("parent.phone2", e.target.value)}
          />
        </div>

        <div>
          <label className="lbl flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!(p.form as any)?.newsletter}
              disabled={p.newsletterBusy || p.saving}
              onChange={(e) => void onNewsletterChange(p, e.target.checked)}
            />
            Newsletter
            {p.newsletterBusy && (
              <span className="text-gray-500 text-sm">Saving…</span>
            )}
          </label>

          <div className="text-xs text-gray-600 mt-1">
            <div>
              <span className="font-medium">Status:</span>{" "}
              {p.statusLabel(p.mk.status)}
              {p.mk.provider ? ` • Provider: ${p.mk.provider}` : ""}
            </div>
            <div>
              {p.mk.consentAt ? `Consent: ${p.fmtDE(p.mk.consentAt)} • ` : ""}
              {p.mk.lastSyncedAt ? `Synced: ${p.fmtDE(p.mk.lastSyncedAt)}` : ""}
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
}

// function onEmailChange(p: Props, next: string) {
//   const hasParent = !!p.form.parent;
//   const trimmed = String(next || "").trim();
//   if (hasParent) {
//     p.up("parent.email", trimmed);
//     return;
//   }
//   p.up("email", trimmed);
//   p.up("emailLower", trimmed.toLowerCase());
// }

function onEmailChange(p: Props, next: string) {
  const trimmed = String(next || "").trim();
  p.up("parent.email", trimmed);
}

function showOnce(p: Props, msg: string) {
  p.setErr(msg);
  window.setTimeout(() => p.setErr(null), 3500);
}

async function onNewsletterChange(p: Props, next: boolean) {
  p.setErr(null);

  if (p.mode !== "edit" || !p.form._id) {
    p.setForm((prev: Customer) => ({ ...prev, newsletter: next }));
    return;
  }

  const prevValue = !!(p.form as any)?.newsletter;

  // const anyForm = p.form as any;
  // const emailToUse =
  //   p.form.parent?.email || anyForm?.email || anyForm?.emailLower || "";

  const emailToUse = p.form.parent?.email || "";

  p.setNewsletterBusy(true);
  try {
    const updated = await toggleNewsletter(p.form._id, next, emailToUse);

    p.setForm((prev: Customer) => ({
      ...prev,
      ...updated,
      newsletter: (updated as any)?.newsletter ?? next,
    }));
  } catch (err: any) {
    p.setForm((prev: Customer) => ({ ...prev, newsletter: prevValue }));
    showOnce(p, err?.message || "Newsletter update failed");
  } finally {
    p.setNewsletterBusy(false);
  }
}
// "use client";

// import React from "react";
// import type { Customer } from "../../../types";
// import { toggleNewsletter } from "../api";

// type Props = {
//   form: Customer;
//   up: (path: string, value: any) => void;
//   mode: "create" | "edit";
//   saving: boolean;
//   newsletterBusy: boolean;
//   setNewsletterBusy: (v: boolean) => void;
//   setForm: (v: any) => void;
//   setErr: (v: string | null) => void;
//   salutationOpen: boolean;
//   setSalutationOpen: (v: boolean | ((p: boolean) => boolean)) => void;
//   salutationDropdownRef: React.RefObject<HTMLDivElement | null>;
//   mk: any;
//   statusLabel: (s?: string) => string;
//   fmtDE: (dt: any) => string;
// };

// export default function CustomerParentFieldset(p: Props) {
//   const anyForm = p.form as any;

//   const emailValue =
//     p.form.parent?.email || anyForm?.email || anyForm?.emailLower || "";

//   return (
//     <fieldset className="card">
//       <legend className="font-bold">Parent</legend>

//       <div className="grid grid-cols-4 gap-2">
//         <div>
//           <label className="lbl">Salutation</label>

//           <div
//             className={
//               "ks-selectbox" + (p.salutationOpen ? " ks-selectbox--open" : "")
//             }
//             ref={p.salutationDropdownRef}
//           >
//             <button
//               type="button"
//               className="ks-selectbox__trigger"
//               onClick={() => p.setSalutationOpen((o) => !o)}
//             >
//               <span className="ks-selectbox__label">
//                 {p.form.parent?.salutation || "—"}
//               </span>
//               <span className="ks-selectbox__chevron" aria-hidden="true" />
//             </button>

//             {p.salutationOpen && (
//               <div className="ks-selectbox__panel">
//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (!p.form.parent?.salutation
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("parent.salutation", "");
//                     p.setSalutationOpen(false);
//                   }}
//                 >
//                   —
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (p.form.parent?.salutation === "Frau"
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("parent.salutation", "Frau");
//                     p.setSalutationOpen(false);
//                   }}
//                 >
//                   Frau
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (p.form.parent?.salutation === "Herr"
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("parent.salutation", "Herr");
//                     p.setSalutationOpen(false);
//                   }}
//                 >
//                   Herr
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div>
//           <label className="lbl">First name</label>
//           <input
//             className="input"
//             value={p.form.parent?.firstName || ""}
//             onChange={(e) => p.up("parent.firstName", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl">Last name</label>
//           <input
//             className="input"
//             value={p.form.parent?.lastName || ""}
//             onChange={(e) => p.up("parent.lastName", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl">Email</label>
//           <input
//             className="input"
//             type="email"
//             value={emailValue}
//             onChange={(e) => onEmailChange(p, e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-2">
//         <div>
//           <label className="lbl">Phone</label>
//           <input
//             className="input"
//             value={p.form.parent?.phone || ""}
//             onChange={(e) => p.up("parent.phone", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl">Phone 2</label>
//           <input
//             className="input"
//             value={p.form.parent?.phone2 || ""}
//             onChange={(e) => p.up("parent.phone2", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={!!p.form.newsletter}
//               disabled={p.newsletterBusy || p.saving}
//               onChange={(e) => void onNewsletterChange(p, e.target.checked)}
//             />
//             Newsletter
//             {p.newsletterBusy && (
//               <span className="text-gray-500 text-sm">Saving…</span>
//             )}
//           </label>

//           <div className="text-xs text-gray-600 mt-1">
//             <div>
//               <span className="font-medium">Status:</span>{" "}
//               {p.statusLabel(p.mk.status)}
//               {p.mk.provider ? ` • Provider: ${p.mk.provider}` : ""}
//             </div>
//             <div>
//               {p.mk.consentAt ? `Consent: ${p.fmtDE(p.mk.consentAt)} • ` : ""}
//               {p.mk.lastSyncedAt ? `Synced: ${p.fmtDE(p.mk.lastSyncedAt)}` : ""}
//             </div>
//           </div>
//         </div>
//       </div>
//     </fieldset>
//   );
// }

// function onEmailChange(p: Props, next: string) {
//   const hasParent = !!p.form.parent;
//   const trimmed = String(next || "").trim();
//   if (hasParent) {
//     p.up("parent.email", trimmed);
//     return;
//   }
//   p.up("email", trimmed);
//   p.up("emailLower", trimmed.toLowerCase());
// }

// function showOnce(p: Props, msg: string) {
//   p.setErr(msg);
//   window.setTimeout(() => p.setErr(null), 3500);
// }

// async function onNewsletterChange(p: Props, next: boolean) {
//   p.setErr(null);
//   p.setForm((prev: Customer) => ({ ...prev, newsletter: next }));
//   if (p.mode !== "edit" || !p.form._id) return;

//   p.setNewsletterBusy(true);
//   try {
//     const updated = await toggleNewsletter(p.form._id, next);
//     p.setForm((prev: Customer) => ({
//       ...prev,
//       ...updated,
//       newsletter: updated?.newsletter ?? next,
//     }));
//   } catch (err: any) {
//     p.setForm((prev: Customer) => ({ ...prev, newsletter: !next }));
//     showOnce(p, err?.message || "Newsletter update failed");
//   } finally {
//     p.setNewsletterBusy(false);
//   }
// }

// "use client";

// import React from "react";
// import type { Customer } from "../../../types";
// import { toggleNewsletter } from "../api";

// type Props = {
//   form: Customer;
//   up: (path: string, value: any) => void;
//   mode: "create" | "edit";
//   saving: boolean;
//   newsletterBusy: boolean;
//   setNewsletterBusy: (v: boolean) => void;
//   setForm: (v: any) => void;
//   setErr: (v: string | null) => void;
//   salutationOpen: boolean;
//   setSalutationOpen: (v: boolean | ((p: boolean) => boolean)) => void;
//   salutationDropdownRef: React.RefObject<HTMLDivElement | null>;
//   mk: any;
//   statusLabel: (s?: string) => string;
//   fmtDE: (dt: any) => string;
// };

// export default function CustomerParentFieldset(p: Props) {
//   const anyForm = p.form as any;

//   const emailValue =
//     p.form.parent?.email || anyForm?.email || anyForm?.emailLower || "";

//   return (
//     <fieldset className="card">
//       <legend className="font-bold">Parent</legend>

//       <div className="grid grid-cols-4 gap-2">
//         <div>
//           <label className="lbl">Salutation</label>

//           <div
//             className={
//               "ks-selectbox" + (p.salutationOpen ? " ks-selectbox--open" : "")
//             }
//             ref={p.salutationDropdownRef}
//           >
//             <button
//               type="button"
//               className="ks-selectbox__trigger"
//               onClick={() => p.setSalutationOpen((o) => !o)}
//             >
//               <span className="ks-selectbox__label">
//                 {p.form.parent?.salutation || "—"}
//               </span>
//               <span className="ks-selectbox__chevron" aria-hidden="true" />
//             </button>

//             {p.salutationOpen && (
//               <div className="ks-selectbox__panel">
//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (!p.form.parent?.salutation
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("parent.salutation", "");
//                     p.setSalutationOpen(false);
//                   }}
//                 >
//                   —
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (p.form.parent?.salutation === "Frau"
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("parent.salutation", "Frau");
//                     p.setSalutationOpen(false);
//                   }}
//                 >
//                   Frau
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (p.form.parent?.salutation === "Herr"
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("parent.salutation", "Herr");
//                     p.setSalutationOpen(false);
//                   }}
//                 >
//                   Herr
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div>
//           <label className="lbl">First name</label>
//           <input
//             className="input"
//             value={p.form.parent?.firstName || ""}
//             onChange={(e) => p.up("parent.firstName", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl">Last name</label>
//           <input
//             className="input"
//             value={p.form.parent?.lastName || ""}
//             onChange={(e) => p.up("parent.lastName", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl">Email</label>
//           <input
//             className="input"
//             type="email"
//             value={emailValue}
//             onChange={(e) => onEmailChange(p, e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-2">
//         <div>
//           <label className="lbl">Phone</label>
//           <input
//             className="input"
//             value={p.form.parent?.phone || ""}
//             onChange={(e) => p.up("parent.phone", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl">Phone 2</label>
//           <input
//             className="input"
//             value={p.form.parent?.phone2 || ""}
//             onChange={(e) => p.up("parent.phone2", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={!!p.form.newsletter}
//               disabled={p.newsletterBusy || p.saving}
//               onChange={(e) => void onNewsletterChange(p, e.target.checked)}
//             />
//             Newsletter
//             {p.newsletterBusy && (
//               <span className="text-gray-500 text-sm">Saving…</span>
//             )}
//           </label>

//           <div
//             className="text-xs text-gray-600 mt-1"
//             title={p.mk.lastError ? `Error: ${p.mk.lastError}` : undefined}
//           >
//             <div>
//               <span className="font-medium">Status:</span>{" "}
//               {p.statusLabel(p.mk.status)}
//               {p.mk.provider ? ` • Provider: ${p.mk.provider}` : ""}
//             </div>
//             <div>
//               {p.mk.consentAt ? `Consent: ${p.fmtDE(p.mk.consentAt)} • ` : ""}
//               {p.mk.lastSyncedAt ? `Synced: ${p.fmtDE(p.mk.lastSyncedAt)}` : ""}
//               {p.mk.lastError && (
//                 <span className="text-red-600"> • Error vorhanden</span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </fieldset>
//   );
// }

// function onEmailChange(p: Props, next: string) {
//   const hasParent = !!p.form.parent;
//   const trimmed = String(next || "").trim();
//   if (hasParent) {
//     p.up("parent.email", trimmed);
//     return;
//   }
//   p.up("email", trimmed);
//   p.up("emailLower", trimmed.toLowerCase());
// }

// async function onNewsletterChange(p: Props, next: boolean) {
//   p.setForm((prev: Customer) => ({ ...prev, newsletter: next }));
//   if (p.mode !== "edit" || !p.form._id) return;

//   p.setNewsletterBusy(true);
//   try {
//     const updated = await toggleNewsletter(p.form._id, next);
//     p.setForm((prev: Customer) => ({
//       ...prev,
//       ...updated,
//       newsletter: updated?.newsletter ?? next,
//     }));
//   } catch (err: any) {
//     p.setForm((prev: Customer) => ({ ...prev, newsletter: !next }));
//     alert(err?.message || "Newsletter update failed");
//   } finally {
//     p.setNewsletterBusy(false);
//   }
// }

// //src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerParentFieldset.tsx
// "use client";

// import React from "react";
// import type { Customer } from "../../../types";
// import { toggleNewsletter } from "../api";

// type Props = {
//   form: Customer;
//   up: (path: string, value: any) => void;
//   mode: "create" | "edit";
//   saving: boolean;
//   newsletterBusy: boolean;
//   setNewsletterBusy: (v: boolean) => void;
//   setForm: (v: any) => void;
//   setErr: (v: string | null) => void;
//   salutationOpen: boolean;
//   setSalutationOpen: (v: boolean | ((p: boolean) => boolean)) => void;
//   salutationDropdownRef: React.RefObject<HTMLDivElement | null>;
//   mk: any;
//   statusLabel: (s?: string) => string;
//   fmtDE: (dt: any) => string;
// };

// export default function CustomerParentFieldset(p: Props) {
//   return (
//     <fieldset className="card">
//       <legend className="font-bold">Parent</legend>

//       <div className="grid grid-cols-4 gap-2">
//         <div>
//           <label className="lbl">Salutation</label>

//           <div
//             className={
//               "ks-selectbox" + (p.salutationOpen ? " ks-selectbox--open" : "")
//             }
//             ref={p.salutationDropdownRef}
//           >
//             <button
//               type="button"
//               className="ks-selectbox__trigger"
//               onClick={() => p.setSalutationOpen((o) => !o)}
//             >
//               <span className="ks-selectbox__label">
//                 {p.form.parent?.salutation || "—"}
//               </span>
//               <span className="ks-selectbox__chevron" aria-hidden="true" />
//             </button>

//             {p.salutationOpen && (
//               <div className="ks-selectbox__panel">
//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (!p.form.parent?.salutation
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("parent.salutation", "");
//                     p.setSalutationOpen(false);
//                   }}
//                 >
//                   —
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (p.form.parent?.salutation === "Frau"
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("parent.salutation", "Frau");
//                     p.setSalutationOpen(false);
//                   }}
//                 >
//                   Frau
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (p.form.parent?.salutation === "Herr"
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("parent.salutation", "Herr");
//                     p.setSalutationOpen(false);
//                   }}
//                 >
//                   Herr
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div>
//           <label className="lbl">First name</label>
//           <input
//             className="input"
//             value={p.form.parent?.firstName || ""}
//             onChange={(e) => p.up("parent.firstName", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl">Last name</label>
//           <input
//             className="input"
//             value={p.form.parent?.lastName || ""}
//             onChange={(e) => p.up("parent.lastName", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl">Email</label>
//           <input
//             className="input"
//             type="email"
//             value={p.form.parent?.email || ""}
//             onChange={(e) => p.up("parent.email", e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-2">
//         <div>
//           <label className="lbl">Phone</label>
//           <input
//             className="input"
//             value={p.form.parent?.phone || ""}
//             onChange={(e) => p.up("parent.phone", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl">Phone 2</label>
//           <input
//             className="input"
//             value={p.form.parent?.phone2 || ""}
//             onChange={(e) => p.up("parent.phone2", e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="lbl flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={!!p.form.newsletter}
//               disabled={p.newsletterBusy || p.saving}
//               onChange={(e) => void onNewsletterChange(p, e.target.checked)}
//             />
//             Newsletter
//             {p.newsletterBusy && (
//               <span className="text-gray-500 text-sm">Saving…</span>
//             )}
//           </label>

//           <div
//             className="text-xs text-gray-600 mt-1"
//             title={p.mk.lastError ? `Error: ${p.mk.lastError}` : undefined}
//           >
//             <div>
//               <span className="font-medium">Status:</span>{" "}
//               {p.statusLabel(p.mk.status)}
//               {p.mk.provider ? ` • Provider: ${p.mk.provider}` : ""}
//             </div>
//             <div>
//               {p.mk.consentAt ? `Consent: ${p.fmtDE(p.mk.consentAt)} • ` : ""}
//               {p.mk.lastSyncedAt ? `Synced: ${p.fmtDE(p.mk.lastSyncedAt)}` : ""}
//               {p.mk.lastError && (
//                 <span className="text-red-600"> • Error vorhanden</span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </fieldset>
//   );
// }

// async function onNewsletterChange(p: Props, next: boolean) {
//   p.setForm((prev: Customer) => ({ ...prev, newsletter: next }));
//   if (p.mode !== "edit" || !p.form._id) return;

//   p.setNewsletterBusy(true);
//   try {
//     const updated = await toggleNewsletter(p.form._id, next);
//     p.setForm((prev: Customer) => ({
//       ...prev,
//       ...updated,
//       newsletter: updated?.newsletter ?? next,
//     }));
//   } catch (err: any) {
//     p.setForm((prev: Customer) => ({ ...prev, newsletter: !next }));
//     alert(err?.message || "Newsletter update failed");
//   } finally {
//     p.setNewsletterBusy(false);
//   }
// }
