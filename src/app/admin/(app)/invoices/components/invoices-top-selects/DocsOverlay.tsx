//src\app\admin\(app)\invoices\components\invoices-top-selects\DocsOverlay.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { DocItem } from "../../utils/invoiceUi";
import { docNoFrom, iconForType, metaLine } from "../../utils/invoiceUi";
import { cssVars } from "./topSelectsUi";

type FixedSelect = {
  open: boolean;
  setOpen: (v: boolean) => void;
  openMenu: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  pos: { left: number; top: number; width: number };
};

type Props = {
  items: DocItem[];
  fmtDate: (iso: string) => string;
  openPdf: (d: DocItem) => void;
  docsSelect: FixedSelect;
};

export default function DocsOverlay({
  items,
  fmtDate,
  openPdf,
  docsSelect,
}: Props) {
  const { t } = useTranslation();
  if (!docsSelect.open || !items.length) return null;

  return (
    <div
      ref={docsSelect.menuRef}
      role="listbox"
      className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--docs ks-scroll-thin ks-invoices__overlay"
      style={cssVars(
        docsSelect.pos.left,
        docsSelect.pos.top,
        docsSelect.pos.width,
      )}
      onWheel={(e) => e.stopPropagation()}
      onScroll={(e) => e.stopPropagation()}
    >
      {items.map((d) => (
        <button
          key={d.id}
          type="button"
          role="option"
          className="ks-selectbox__option ks-documents-option ks-doc-select__option ks-storno__option ks-invoices__cursorPointer"
          onClick={() => {
            docsSelect.setOpen(false);
            openPdf(d);
          }}
        >
          <div className="ks-doc-select__row">
            <div className="ks-doc-select__top ks-doc-select__top--single">
              <div className="ks-doc-select__title" title={d.title}>
                <span className="ks-doc-select__typeIcon" aria-hidden="true">
                  <img src={iconForType(d.type)} alt="" />
                </span>

                <div className="ks-invoices__docTextCol">
                  <div className="ks-doc-select__bottom">
                    {metaLine(d, fmtDate, t)}
                  </div>
                </div>
              </div>

              <div className="ks-doc-select__badgeCol" aria-hidden>
                <span className="ks-doc-select__badge">
                  {docNoFrom(d) || ""}
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// //src\app\admin\(app)\invoices\components\invoices-top-selects\DocsOverlay.tsx
// "use client";

// import React from "react";
// import type { DocItem } from "../../utils/invoiceUi";
// import {
//   displayTitle,
//   docNoFrom,
//   iconForType,
//   metaLine,
// } from "../../utils/invoiceUi";
// import { cssVars } from "./topSelectsUi";

// type FixedSelect = {
//   open: boolean;
//   setOpen: (v: boolean) => void;
//   openMenu: () => void;
//   triggerRef: React.RefObject<HTMLButtonElement | null>;
//   menuRef: React.RefObject<HTMLDivElement | null>;
//   pos: { left: number; top: number; width: number };
// };

// type Props = {
//   items: DocItem[];
//   fmtDate: (iso: string) => string;
//   openPdf: (d: DocItem) => void;
//   docsSelect: FixedSelect;
// };

// export default function DocsOverlay({
//   items,
//   fmtDate,
//   openPdf,
//   docsSelect,
// }: Props) {
//   if (!docsSelect.open || !items.length) return null;

//   return (
//     <div
//       ref={docsSelect.menuRef}
//       role="listbox"
//       className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--docs ks-scroll-thin ks-invoices__overlay"
//       style={cssVars(
//         docsSelect.pos.left,
//         docsSelect.pos.top,
//         docsSelect.pos.width,
//       )}
//       onWheel={(e) => e.stopPropagation()}
//       onScroll={(e) => e.stopPropagation()}
//     >
//       {items.map((d) => (
//         <button
//           key={d.id}
//           type="button"
//           role="option"
//           className="ks-selectbox__option ks-documents-option ks-doc-select__option ks-storno__option ks-invoices__cursorPointer"
//           onClick={() => {
//             docsSelect.setOpen(false);
//             openPdf(d);
//           }}
//         >
//           <div className="ks-doc-select__row">
//             <div className="ks-doc-select__top ks-doc-select__top--single">
//               <div className="ks-doc-select__title" title={d.title}>
//                 <span className="ks-doc-select__typeIcon" aria-hidden="true">
//                   <img src={iconForType(d.type)} alt="" />
//                 </span>

//                 <div className="ks-invoices__docTextCol">
//                   <span className="ks-doc-select__titleText">
//                     {displayTitle(d)}
//                   </span>
//                   <div className="ks-doc-select__bottom">
//                     {metaLine(d, fmtDate)}
//                   </div>
//                 </div>
//               </div>

//               <div className="ks-doc-select__badgeCol" aria-hidden>
//                 <span className="ks-doc-select__badge">
//                   {docNoFrom(d) || ""}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </button>
//       ))}
//     </div>
//   );
// }
