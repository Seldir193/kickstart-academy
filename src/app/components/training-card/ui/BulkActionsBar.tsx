//src\app\components\training-card\ui\BulkActionsBar.tsx
"use client";

import type { RefObject } from "react";

type Props = {
  toggleRef: RefObject<HTMLButtonElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  clearRef: RefObject<HTMLButtonElement | null>;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  selectedCount: number;
  allSelected: boolean;
  busy: boolean;
  isEmpty: boolean;
  onToggleAll: () => void;
  onClear: () => void;
  onBulkDelete: () => void;
};

export default function BulkActionsBar({
  toggleRef,
  cancelRef,
  clearRef,
  selectMode,
  onToggleSelectMode,
  selectedCount,
  allSelected,
  busy,
  isEmpty,
  onToggleAll,
  onClear,
  onBulkDelete,
}: Props) {
  const showClear = selectMode && selectedCount >= 2;

  function guard(cb: () => void) {
    if (busy) return;
    cb();
  }

  if (!selectMode) {
    return (
      <div className="bookings-admin news-admin__box--scroll3   ">
        <div className="actions news-admin__actions">
          <button
            ref={toggleRef}
            type="button"
            className="btn btn--select-toggle"
            onClick={() => guard(onToggleSelectMode)}
            disabled={isEmpty}
          >
            Auswählen
          </button>
        </div>
      </div>
    );
  }

  const deleteDisabled = busy || selectedCount === 0;
  const allDisabled = busy || isEmpty;

  return (
    <div className="news-admin__top-actions">
      <div className="bulkbar">
        <div className="bulkbar__left">
          <strong>{selectedCount}</strong>&nbsp;ausgewählt
        </div>

        <div className="bulkbar__right">
          {showClear ? (
            <button
              ref={clearRef}
              type="button"
              className="btn btn--select-toggle is-active"
              onClick={() => guard(onClear)}
              disabled={allDisabled}
            >
              Alles aufheben
            </button>
          ) : (
            <button
              type="button"
              className={`btn btn--select-toggle ${allSelected ? "is-active" : ""}`}
              onClick={() => guard(onToggleAll)}
              disabled={allDisabled}
            >
              {allSelected ? "Alles aufheben" : "Alle auswählen"}
            </button>
          )}

          <button
            type="button"
            className="btn btn--danger"
            onClick={() => guard(onBulkDelete)}
            disabled={deleteDisabled}
          >
            Löschen ({selectedCount})
          </button>

          <button
            ref={cancelRef}
            type="button"
            className="btn"
            onClick={() => guard(onToggleSelectMode)}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import React from "react";

// type Props = {
//   selectMode: boolean;
//   selectedCount: number;
//   allSelected: boolean;
//   onToggleSelectMode: () => void;
//   onToggleAll: () => void;
//   onClear: () => void;
//   onBulkDelete: () => void;
// };

// export default function BulkActionsBar({
//   selectMode,
//   selectedCount,
//   allSelected,
//   onToggleSelectMode,
//   onToggleAll,
//   onClear,
//   onBulkDelete,
// }: Props) {
//   const countLabel = `${selectedCount} ausgewählt`;

//   return (
//     <div className="news-admin__top-actions">
//       <div className="bulkbar" aria-live="polite">
//         <div className="bulkbar__left">{selectMode ? countLabel : ""}</div>

//         <div className="bulkbar__right">
//           {!selectMode ? (
//             <button type="button" className="btn" onClick={onToggleSelectMode}>
//               Auswählen
//             </button>
//           ) : (
//             <>
//               <button type="button" className="btn" onClick={onToggleAll}>
//                 {allSelected ? "Alle aufheben" : "Alle auswählen"}
//               </button>

//               <button
//                 type="button"
//                 className="btn btn--danger"
//                 onClick={onBulkDelete}
//                 disabled={selectedCount <= 0}
//               >
//                 Löschen ({selectedCount})
//               </button>

//               <button
//                 type="button"
//                 className="btn"
//                 onClick={() => {
//                   onClear();
//                   onToggleSelectMode();
//                 }}
//               >
//                 Abbrechen
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import React from "react";

// type Props = {
//   selectedCount: number;
//   onClear: () => void;
//   onBulkDelete: () => void;
// };

// export default function BulkActionsBar({
//   selectedCount,
//   onClear,
//   onBulkDelete,
// }: Props) {
//   if (selectedCount <= 0) return null;

//   return (
//     <section className="card" aria-live="polite">
//       <div className="card-head">
//         <h3 className="card-title m-0">{selectedCount} selected</h3>
//         <div className="card-actions" style={{ display: "flex", gap: 8 }}>
//           <button className="btn" onClick={onClear}>
//             Clear
//           </button>
//           <button className="btn btn--danger" onClick={onBulkDelete}>
//             Delete selected
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }
