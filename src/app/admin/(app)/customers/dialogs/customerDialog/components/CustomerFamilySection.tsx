"use client";

import React from "react";
import type { FamilyMember } from "../types";
import { formatChildLabel } from "../formatters";

type Props = {
  mode: "create" | "edit";
  childFamilyMembers: FamilyMember[];
  selfFamilyMembers: FamilyMember[];
  familyLoading: boolean;
  familyError: string | null;
  familyDropdownOpen: boolean;
  selfDropdownOpen: boolean;
  setFamilyDropdownOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  setSelfDropdownOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  familyDropdownRef: React.RefObject<HTMLDivElement | null>;
  selfDropdownRef: React.RefObject<HTMLDivElement | null>;
  activeFamilyId: string;
  selectedChildLabel: string;
  selectedSelfLabel: string;
  handleSelectFamilyMember: (id: string) => void;
  handleAddSibling: () => void;
  handleAddParent: () => void;
};

function formatSelfLabel(member: FamilyMember) {
  const first = String(member?.parent?.firstName ?? "").trim();
  const last = String(member?.parent?.lastName ?? "").trim();
  const label = [first, last].filter(Boolean).join(" ");
  return label || "Parent";
}

function rememberButtonFocusState(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.dataset.wasFocused = String(
    document.activeElement === e.currentTarget,
  );
}

function toggleButtonFocus(
  e: React.MouseEvent<HTMLButtonElement>,
  action: () => void,
) {
  const btn = e.currentTarget;
  const wasFocused = btn.dataset.wasFocused === "true";
  action();
  requestAnimationFrame(() => {
    if (wasFocused) btn.blur();
    else btn.focus({ preventScroll: true });
    delete btn.dataset.wasFocused;
  });
}

function renderDropdown(
  label: string,
  items: FamilyMember[],
  open: boolean,
  setOpen: (v: boolean | ((p: boolean) => boolean)) => void,
  dropdownRef: React.RefObject<HTMLDivElement | null>,
  activeFamilyId: string,
  selectedLabel: string,
  placeholder: string,
  onSelect: (id: string) => void,
  itemLabel: (member: FamilyMember) => string,
  keepVisible = false,
) {
  if (!items.length && !keepVisible) return null;

  return (
    <div>
      <label className="lbl">{label}</label>

      <div
        className={"family-dropdown" + (open ? " family-dropdown--open" : "")}
        ref={dropdownRef}
      >
        <button
          type="button"
          className="family-dropdown-trigger input"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="family-dropdown-label">
            {selectedLabel || placeholder}
          </span>
          <span className="family-dropdown-caret" aria-hidden="true" />
        </button>

        {open ? (
          <ul className="family-dropdown-menu" role="listbox">
            {items.length
              ? items.map((m) => (
                  <li
                    key={m._id}
                    className={
                      "family-dropdown-item" +
                      (m._id === activeFamilyId
                        ? " family-dropdown-item--active"
                        : "")
                    }
                    onClick={() => onSelect(m._id)}
                    role="option"
                    aria-selected={m._id === activeFamilyId}
                  >
                    {itemLabel(m)}
                  </li>
                ))
              : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default function CustomerFamilySection(p: Props) {
  if (p.mode !== "edit") return null;

  return (
    <fieldset className="card mb-3">
      <legend className="font-bold">Family / children</legend>

      {p.familyLoading ? (
        <div className="text-xs text-gray-600 mb-1">Loading family…</div>
      ) : null}

      {p.familyError ? (
        <div className="text-xs text-red-600 mb-1">{p.familyError}</div>
      ) : null}

      {p.childFamilyMembers.length || p.selfFamilyMembers.length ? (
        <>
          <div className="grid md:grid-cols-2 gap-2 mb-2">
            {renderDropdown(
              "Select child",
              p.childFamilyMembers,
              p.familyDropdownOpen,
              p.setFamilyDropdownOpen,
              p.familyDropdownRef,
              p.activeFamilyId,
              p.selectedChildLabel,
              "Select child…",
              p.handleSelectFamilyMember,
              formatChildLabel,
            )}

            {renderDropdown(
              "Select parent",
              p.selfFamilyMembers,
              p.selfDropdownOpen,
              p.setSelfDropdownOpen,
              p.selfDropdownRef,
              p.activeFamilyId,
              p.selectedSelfLabel,
              "Select parent",
              p.handleSelectFamilyMember,
              formatSelfLabel,
              true,
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-sm mt-1">
            <button
              type="button"
              className="btn btn-outline btn-sm ks-customer-family__add-btn"
              onMouseDown={rememberButtonFocusState}
              onClick={(e) => toggleButtonFocus(e, p.handleAddSibling)}
            >
              <img
                src="/icons/plus.svg"
                alt=""
                aria-hidden="true"
                className="btn__icon ks-customer-family__add-icon"
              />
              <span>Add another child</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm ks-customer-family__add-btn"
              onMouseDown={rememberButtonFocusState}
              onClick={(e) => toggleButtonFocus(e, p.handleAddParent)}
            >
              <img
                src="/icons/plus.svg"
                alt=""
                aria-hidden="true"
                className="btn__icon ks-customer-family__add-icon"
              />
              <span>Add another parent</span>
            </button>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-600">
          No additional children linked yet.
        </div>
      )}
    </fieldset>
  );
}
// //src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerFamilySection.tsx
// "use client";

// import React from "react";
// import type { FamilyMember } from "../types";
// import { formatChildLabel } from "../formatters";

// type Props = {
//   mode: "create" | "edit";
//   childFamilyMembers: FamilyMember[];
//   selfFamilyMembers: FamilyMember[];
//   familyLoading: boolean;
//   familyError: string | null;
//   familyDropdownOpen: boolean;
//   selfDropdownOpen: boolean;
//   setFamilyDropdownOpen: (v: boolean | ((p: boolean) => boolean)) => void;
//   setSelfDropdownOpen: (v: boolean | ((p: boolean) => boolean)) => void;
//   familyDropdownRef: React.RefObject<HTMLDivElement | null>;
//   selfDropdownRef: React.RefObject<HTMLDivElement | null>;
//   activeFamilyId: string;
//   selectedChildLabel: string;
//   selectedSelfLabel: string;
//   handleSelectFamilyMember: (id: string) => void;
//   handleAddSibling: () => void;
//   handleAddParent: () => void;
// };

// function formatSelfLabel(member: FamilyMember) {
//   const first = String(member?.parent?.firstName ?? "").trim();
//   const last = String(member?.parent?.lastName ?? "").trim();
//   const label = [first, last].filter(Boolean).join(" ");
//   return label || "Parent";
// }

// function renderDropdown(
//   label: string,
//   items: FamilyMember[],
//   open: boolean,
//   setOpen: (v: boolean | ((p: boolean) => boolean)) => void,
//   dropdownRef: React.RefObject<HTMLDivElement | null>,
//   activeFamilyId: string,
//   selectedLabel: string,
//   placeholder: string,
//   onSelect: (id: string) => void,
//   itemLabel: (member: FamilyMember) => string,
//   keepVisible = false,
// ) {
//   if (!items.length && !keepVisible) return null;

//   return (
//     <div>
//       <label className="lbl">{label}</label>

//       <div
//         className={"family-dropdown" + (open ? " family-dropdown--open" : "")}
//         ref={dropdownRef}
//       >
//         <button
//           type="button"
//           className="family-dropdown-trigger input"
//           onClick={() => setOpen((o) => !o)}
//           aria-haspopup="listbox"
//           aria-expanded={open}
//         >
//           <span className="family-dropdown-label">
//             {selectedLabel || placeholder}
//           </span>
//           <span className="family-dropdown-caret" aria-hidden="true" />
//         </button>

//         {open ? (
//           <ul className="family-dropdown-menu" role="listbox">
//             {items.length
//               ? items.map((m) => (
//                   <li
//                     key={m._id}
//                     className={
//                       "family-dropdown-item" +
//                       (m._id === activeFamilyId
//                         ? " family-dropdown-item--active"
//                         : "")
//                     }
//                     onClick={() => onSelect(m._id)}
//                     role="option"
//                     aria-selected={m._id === activeFamilyId}
//                   >
//                     {itemLabel(m)}
//                   </li>
//                 ))
//               : null}
//           </ul>
//         ) : null}
//       </div>
//     </div>
//   );
// }

// export default function CustomerFamilySection(p: Props) {
//   if (p.mode !== "edit") return null;

//   return (
//     <fieldset className="card mb-3">
//       <legend className="font-bold">Family / children</legend>

//       {p.familyLoading ? (
//         <div className="text-xs text-gray-600 mb-1">Loading family…</div>
//       ) : null}

//       {p.familyError ? (
//         <div className="text-xs text-red-600 mb-1">{p.familyError}</div>
//       ) : null}

//       {p.childFamilyMembers.length || p.selfFamilyMembers.length ? (
//         <>
//           <div className="grid md:grid-cols-2 gap-2 mb-2">
//             {renderDropdown(
//               "Select child",
//               p.childFamilyMembers,
//               p.familyDropdownOpen,
//               p.setFamilyDropdownOpen,
//               p.familyDropdownRef,
//               p.activeFamilyId,
//               p.selectedChildLabel,
//               "Select child…",
//               p.handleSelectFamilyMember,
//               formatChildLabel,
//             )}

//             {renderDropdown(
//               "Select parent",
//               p.selfFamilyMembers,
//               p.selfDropdownOpen,
//               p.setSelfDropdownOpen,
//               p.selfDropdownRef,
//               p.activeFamilyId,
//               p.selectedSelfLabel,
//               "Select parent",
//               p.handleSelectFamilyMember,
//               formatSelfLabel,
//               true,
//             )}
//           </div>

//           <div className="flex flex-wrap gap-2 text-sm mt-1">
//             {/* <button
//               type="button"
//               className="btn btn-outline btn-sm ks-customer-family__add-btn"
//               onClick={p.handleAddSibling}
//             >
//               <img
//                 src="/icons/plus.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="btn__icon ks-customer-family__add-icon"
//               />
//               <span>Add another child</span>
//             </button>

//             <button
//               type="button"
//               className="btn btn-outline btn-sm ks-customer-family__add-btn"
//               onClick={p.handleAddParent}
//             >
//               <img
//                 src="/icons/plus.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="btn__icon ks-customer-family__add-icon"
//               />
//               <span>Add another parent</span>
//             </button> */}

//             <button
//               type="button"
//               className="btn btn-outline btn-sm ks-customer-family__add-btn"
//               onClick={p.handleAddSibling}
//               onMouseUp={(e) => e.currentTarget.blur()}
//             >
//               <img
//                 src="/icons/plus.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="btn__icon ks-customer-family__add-icon"
//               />
//               <span>Add another child</span>
//             </button>

//             <button
//               type="button"
//               className="btn btn-outline btn-sm ks-customer-family__add-btn"
//               onClick={p.handleAddParent}
//               onMouseUp={(e) => e.currentTarget.blur()}
//             >
//               <img
//                 src="/icons/plus.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="btn__icon ks-customer-family__add-icon"
//               />
//               <span>Add another parent</span>
//             </button>
//           </div>
//         </>
//       ) : (
//         <div className="text-sm text-gray-600">
//           No additional children linked yet.
//         </div>
//       )}
//     </fieldset>
//   );
// }

// //src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerFamilySection.tsx
// "use client";

// import React from "react";
// import type { FamilyMember } from "../types";
// import { formatChildLabel } from "../formatters";

// type Props = {
//   mode: "create" | "edit";
//   childFamilyMembers: FamilyMember[];
//   selfFamilyMembers: FamilyMember[];
//   familyLoading: boolean;
//   familyError: string | null;
//   familyDropdownOpen: boolean;
//   selfDropdownOpen: boolean;
//   setFamilyDropdownOpen: (v: boolean | ((p: boolean) => boolean)) => void;
//   setSelfDropdownOpen: (v: boolean | ((p: boolean) => boolean)) => void;
//   familyDropdownRef: React.RefObject<HTMLDivElement | null>;
//   selfDropdownRef: React.RefObject<HTMLDivElement | null>;
//   activeFamilyId: string;
//   selectedChildLabel: string;
//   selectedSelfLabel: string;
//   handleSelectFamilyMember: (id: string) => void;
//   handleAddSibling: () => void;
//   handleAddParent: () => void;
// };

// function formatSelfLabel(member: FamilyMember) {
//   const first = String(member?.parent?.firstName ?? "").trim();
//   const last = String(member?.parent?.lastName ?? "").trim();
//   const label = [first, last].filter(Boolean).join(" ");
//   return label || "Elternteil";
//   // return [first, last].filter(Boolean).join(" ");
// }

// function renderDropdown(
//   label: string,
//   items: FamilyMember[],
//   open: boolean,
//   setOpen: (v: boolean | ((p: boolean) => boolean)) => void,
//   dropdownRef: React.RefObject<HTMLDivElement | null>,
//   activeFamilyId: string,
//   selectedLabel: string,
//   placeholder: string,
//   onSelect: (id: string) => void,
//   itemLabel: (member: FamilyMember) => string,
//   keepVisible = false,
// ) {
//   if (!items.length && !keepVisible) return null;

//   return (
//     <div>
//       <label className="lbl">{label}</label>

//       <div
//         className={"family-dropdown" + (open ? " family-dropdown--open" : "")}
//         ref={dropdownRef}
//       >
//         <button
//           type="button"
//           className="family-dropdown-trigger input"
//           onClick={() => setOpen((o) => !o)}
//           aria-haspopup="listbox"
//           aria-expanded={open}
//         >
//           <span className="family-dropdown-label">
//             {selectedLabel || placeholder}
//           </span>
//           <span className="family-dropdown-caret" aria-hidden="true" />
//         </button>

//         {open && (
//           <ul className="family-dropdown-menu" role="listbox">
//             {items.length
//               ? items.map((m) => (
//                   <li
//                     key={m._id}
//                     className={
//                       "family-dropdown-item" +
//                       (m._id === activeFamilyId
//                         ? " family-dropdown-item--active"
//                         : "")
//                     }
//                     onClick={() => onSelect(m._id)}
//                     role="option"
//                     aria-selected={m._id === activeFamilyId}
//                   >
//                     {itemLabel(m)}
//                   </li>
//                 ))
//               : null}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function CustomerFamilySection(p: Props) {
//   if (p.mode !== "edit") return null;

//   return (
//     <fieldset className="card mb-3">
//       <legend className="font-bold">Family / Kinder</legend>

//       {p.familyLoading && (
//         <div className="text-xs text-gray-600 mb-1">Familie wird geladen…</div>
//       )}
//       {p.familyError && (
//         <div className="text-xs text-red-600 mb-1">{p.familyError}</div>
//       )}

//       {p.childFamilyMembers.length || p.selfFamilyMembers.length ? (
//         <>
//           <div className="grid md:grid-cols-2 gap-2 mb-2">
//             {renderDropdown(
//               "Kind wählen",
//               p.childFamilyMembers,
//               p.familyDropdownOpen,
//               p.setFamilyDropdownOpen,
//               p.familyDropdownRef,
//               p.activeFamilyId,
//               p.selectedChildLabel,
//               "Kind wählen …",
//               p.handleSelectFamilyMember,
//               formatChildLabel,
//             )}

//             {renderDropdown(
//               "Elternteil wählen",
//               p.selfFamilyMembers,
//               p.selfDropdownOpen,
//               p.setSelfDropdownOpen,
//               p.selfDropdownRef,
//               p.activeFamilyId,
//               p.selectedSelfLabel,
//               "Elternteil wählen",
//               p.handleSelectFamilyMember,
//               formatSelfLabel,
//               true,
//             )}
//           </div>

//           <div className="flex flex-wrap gap-2 text-sm mt-1">
//             <button
//               type="button"
//               className="btn btn-outline btn-sm"
//               onClick={p.handleAddSibling}
//             >
//               <img
//                 src="/icons/plus.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="btn__icon"
//               />
//               <span>weiteres Kind hinzufügen</span>
//             </button>

//             <button
//               type="button"
//               className="btn btn-outline btn-sm"
//               onClick={p.handleAddParent}
//             >
//               <img
//                 src="/icons/plus.svg"
//                 alt=""
//                 aria-hidden="true"
//                 className="btn__icon"
//               />
//               <span>weiteren Elternteil hinzufügen</span>
//             </button>
//           </div>
//         </>
//       ) : (
//         <div className="text-sm text-gray-600">
//           Noch keine weiteren Kinder verknüpft.
//         </div>
//       )}
//     </fieldset>
//   );
// }
