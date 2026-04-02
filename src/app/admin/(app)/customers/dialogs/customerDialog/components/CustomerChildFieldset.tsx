"use client";

import React from "react";
import type { Customer } from "../../../types";
import KsBirthDateSelect from "../../components/KsBirthDateSelect";

type Props = {
  form: Customer;
  up: (path: string, value: any) => void;
  genderOpen: boolean;
  setGenderOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  genderDropdownRef: React.RefObject<HTMLDivElement | null>;
};

function genderLabel(value?: string) {
  if (value === "weiblich") return "Female";
  if (value === "männlich") return "Male";
  return "—";
}

export default function CustomerChildFieldset(p: Props) {
  return (
    <fieldset className="card">
      <legend className="font-bold">Child</legend>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="lbl">First name</label>
          <input
            className="input"
            value={p.form.child?.firstName || ""}
            onChange={(e) => p.up("child.firstName", e.target.value)}
          />
        </div>
        <div>
          <label className="lbl">Last name</label>
          <input
            className="input"
            value={p.form.child?.lastName || ""}
            onChange={(e) => p.up("child.lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="lbl">Gender</label>

          <div
            className={
              "ks-selectbox" + (p.genderOpen ? " ks-selectbox--open" : "")
            }
            ref={p.genderDropdownRef}
          >
            <button
              type="button"
              className="ks-selectbox__trigger"
              onClick={() => p.setGenderOpen((o) => !o)}
            >
              <span className="ks-selectbox__label">
                {genderLabel(p.form.child?.gender)}
              </span>
              <span className="ks-selectbox__chevron" aria-hidden="true" />
            </button>

            {p.genderOpen ? (
              <div className="ks-selectbox__panel">
                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (!p.form.child?.gender
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("child.gender", "");
                    p.setGenderOpen(false);
                  }}
                >
                  —
                </button>

                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (p.form.child?.gender === "weiblich"
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("child.gender", "weiblich");
                    p.setGenderOpen(false);
                  }}
                >
                  Female
                </button>

                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (p.form.child?.gender === "männlich"
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("child.gender", "männlich");
                    p.setGenderOpen(false);
                  }}
                >
                  Male
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <label className="lbl">Birth date</label>
          <KsBirthDateSelect
            value={p.form.child?.birthDate}
            onChange={(iso) => p.up("child.birthDate", iso)}
            fromYear={1980}
            toYear={new Date().getFullYear()}
          />
        </div>

        <div>
          <label className="lbl">Club</label>
          <input
            className="input"
            value={p.form.child?.club || ""}
            onChange={(e) => p.up("child.club", e.target.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}

// //src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerChildFieldset.tsx
// "use client";

// import React from "react";
// import type { Customer } from "../../../types";
// import KsBirthDateSelect from "../../components/KsBirthDateSelect";

// type Props = {
//   form: Customer;
//   up: (path: string, value: any) => void;
//   genderOpen: boolean;
//   setGenderOpen: (v: boolean | ((p: boolean) => boolean)) => void;
//   genderDropdownRef: React.RefObject<HTMLDivElement | null>;
// };

// export default function CustomerChildFieldset(p: Props) {
//   return (
//     <fieldset className="card">
//       <legend className="font-bold">Child</legend>

//       <div className="grid grid-cols-2 gap-2">
//         <div>
//           <label className="lbl">First name</label>
//           <input
//             className="input"
//             value={p.form.child?.firstName || ""}
//             onChange={(e) => p.up("child.firstName", e.target.value)}
//           />
//         </div>
//         <div>
//           <label className="lbl">Last name</label>
//           <input
//             className="input"
//             value={p.form.child?.lastName || ""}
//             onChange={(e) => p.up("child.lastName", e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-2">
//         <div>
//           <label className="lbl">Gender</label>

//           <div
//             className={
//               "ks-selectbox" + (p.genderOpen ? " ks-selectbox--open" : "")
//             }
//             ref={p.genderDropdownRef}
//           >
//             <button
//               type="button"
//               className="ks-selectbox__trigger"
//               onClick={() => p.setGenderOpen((o) => !o)}
//             >
//               <span className="ks-selectbox__label">
//                 {p.form.child?.gender || "—"}
//               </span>
//               <span className="ks-selectbox__chevron" aria-hidden="true" />
//             </button>

//             {p.genderOpen && (
//               <div className="ks-selectbox__panel">
//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (!p.form.child?.gender
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("child.gender", "");
//                     p.setGenderOpen(false);
//                   }}
//                 >
//                   —
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (p.form.child?.gender === "weiblich"
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("child.gender", "weiblich");
//                     p.setGenderOpen(false);
//                   }}
//                 >
//                   weiblich
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     "ks-selectbox__option" +
//                     (p.form.child?.gender === "männlich"
//                       ? " ks-selectbox__option--active"
//                       : "")
//                   }
//                   onClick={() => {
//                     p.up("child.gender", "männlich");
//                     p.setGenderOpen(false);
//                   }}
//                 >
//                   männlich
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div>
//           <label className="lbl">Birth date</label>
//           <KsBirthDateSelect
//             value={p.form.child?.birthDate}
//             onChange={(iso) => p.up("child.birthDate", iso)}
//             fromYear={1980}
//             toYear={new Date().getFullYear()}
//           />
//         </div>

//         <div>
//           <label className="lbl">Club</label>
//           <input
//             className="input"
//             value={p.form.child?.club || ""}
//             onChange={(e) => p.up("child.club", e.target.value)}
//           />
//         </div>
//       </div>
//     </fieldset>
//   );
// }
