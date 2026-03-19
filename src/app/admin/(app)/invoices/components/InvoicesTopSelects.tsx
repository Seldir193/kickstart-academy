// //src\app\admin\(app)\invoices\components\InvoicesTopSelects.tsx
"use client";

export { default } from "./invoices-top-selects/InvoicesTopSelects";

// "use client";

// import React from "react";
// import type { DocItem, SortOrder } from "../utils/invoiceUi";
// import {
//   displayTitle,
//   docNoFrom,
//   iconForType,
//   metaLine,
//   sortLabel,
// } from "../utils/invoiceUi";

// type FixedSelect = {
//   open: boolean;
//   setOpen: (v: boolean) => void;
//   openMenu: () => void;
//   triggerRef: React.RefObject<HTMLButtonElement | null>;
//   menuRef: React.RefObject<HTMLDivElement | null>;
//   pos: { left: number; top: number; width: number };
// };

// type Props = {
//   loading: boolean;
//   items: DocItem[];
//   docsSelect: FixedSelect;
//   sortSelect: FixedSelect;
//   sortOrder: SortOrder;
//   setSortOrder: (v: SortOrder) => void;
//   resetPage: () => void;
//   openPdf: (d: DocItem) => void;
//   fmtDate: (iso: string) => string;
// };

// function cssVars(left: number, top: number, width: number) {
//   return {
//     ["--ksLeft" as any]: `${left}px`,
//     ["--ksTop" as any]: `${top}px`,
//     ["--ksWidth" as any]: `${width}px`,
//   };
// }

// export default function InvoicesTopSelects({
//   loading,
//   items,
//   docsSelect,
//   sortSelect,
//   sortOrder,
//   setSortOrder,
//   resetPage,
//   openPdf,
//   fmtDate,
// }: Props) {
//   return (
//     <div className="ks-invoices__mt12">
//       <label className="lbl">Dokumente (aktuelle Seite)</label>

//       <div className="ks-invoices__selectRow">
//         <div
//           className={
//             "ks-selectbox" + (docsSelect.open ? " ks-selectbox--open" : "")
//           }
//         >
//           <button
//             ref={docsSelect.triggerRef}
//             type="button"
//             className="ks-selectbox__trigger input ks-invoices__selectTrigger"
//             onClick={() =>
//               docsSelect.open
//                 ? docsSelect.setOpen(false)
//                 : docsSelect.openMenu()
//             }
//             disabled={loading || !items.length}
//             aria-haspopup="listbox"
//             aria-expanded={docsSelect.open}
//           >
//             <span className="ks-selectbox__label">
//               {items.length
//                 ? `Dokumente: ${items.length} auf dieser Seite`
//                 : loading
//                   ? "Lade…"
//                   : "Dokumente: 0 auf dieser Seite"}
//             </span>
//             <span className="ks-selectbox__chevron" aria-hidden="true" />
//           </button>
//         </div>

//         <div
//           className={
//             "ks-selectbox" + (sortSelect.open ? " ks-selectbox--open" : "")
//           }
//         >
//           <button
//             ref={sortSelect.triggerRef}
//             type="button"
//             className="ks-selectbox__trigger input ks-invoices__selectTrigger"
//             onClick={() =>
//               sortSelect.open
//                 ? sortSelect.setOpen(false)
//                 : sortSelect.openMenu()
//             }
//             aria-haspopup="listbox"
//             aria-expanded={sortSelect.open}
//           >
//             <span className="ks-selectbox__label">{sortLabel(sortOrder)}</span>
//             <span className="ks-selectbox__chevron" aria-hidden="true" />
//           </button>
//         </div>
//       </div>

//       <div className="text-gray-600 mt-1">
//         Klick auf einen Eintrag öffnet das PDF in neuem Tab.
//       </div>

//       {docsSelect.open && !!items.length && (
//         <div
//           ref={docsSelect.menuRef}
//           role="listbox"
//           className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--docs ks-scroll-thin ks-invoices__overlay"
//           style={cssVars(
//             docsSelect.pos.left,
//             docsSelect.pos.top,
//             docsSelect.pos.width,
//           )}
//           onWheel={(e) => e.stopPropagation()}
//           onScroll={(e) => e.stopPropagation()}
//         >
//           {items.map((d) => (
//             <button
//               key={d.id}
//               type="button"
//               role="option"
//               className="ks-selectbox__option ks-documents-option ks-doc-select__option ks-storno__option ks-invoices__cursorPointer"
//               onClick={() => {
//                 docsSelect.setOpen(false);
//                 openPdf(d);
//               }}
//             >
//               <div className="ks-doc-select__row">
//                 <div className="ks-doc-select__top ks-doc-select__top--single">
//                   <div className="ks-doc-select__title" title={d.title}>
//                     <span
//                       className="ks-doc-select__typeIcon"
//                       aria-hidden="true"
//                     >
//                       <img src={iconForType(d.type)} alt="" />
//                     </span>

//                     <div className="ks-invoices__docTextCol">
//                       <span className="ks-doc-select__titleText">
//                         {displayTitle(d)}
//                       </span>
//                       <div className="ks-doc-select__bottom">
//                         {metaLine(d, fmtDate)}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="ks-doc-select__badgeCol" aria-hidden>
//                     <span className="ks-doc-select__badge">
//                       {docNoFrom(d) || ""}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>
//       )}

//       {sortSelect.open && (
//         <div
//           ref={sortSelect.menuRef}
//           role="listbox"
//           className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--sort ks-scroll-thin ks-invoices__overlay"
//           style={cssVars(
//             sortSelect.pos.left,
//             sortSelect.pos.top,
//             sortSelect.pos.width,
//           )}
//           onWheel={(e) => e.stopPropagation()}
//           onScroll={(e) => e.stopPropagation()}
//         >
//           {(["newest", "oldest"] as SortOrder[]).map((v) => (
//             <button
//               key={v}
//               type="button"
//               role="option"
//               aria-selected={sortOrder === v}
//               className={
//                 "ks-selectbox__option ks-documents-option ks-invoices__cursorPointer" +
//                 (sortOrder === v ? " ks-selectbox__option--active" : "")
//               }
//               onClick={() => {
//                 setSortOrder(v);
//                 resetPage();
//                 sortSelect.setOpen(false);
//               }}
//             >
//               {sortLabel(v)}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
