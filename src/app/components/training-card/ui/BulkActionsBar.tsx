// src/app/components/training-card/ui/BulkActionsBar.tsx
"use client";

import type { RefObject } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const showClear = selectMode && selectedCount >= 2;

  function guard(cb: () => void) {
    if (busy) return;
    cb();
  }

  if (!selectMode) {
    return (
      <div className="bookings-admin news-admin__box--scroll3">
        <div className="actions news-admin__actions">
          <button
            ref={toggleRef}
            type="button"
            className="btn btn--select-toggle"
            onClick={() => guard(onToggleSelectMode)}
            disabled={isEmpty}
          >
            {t("common.training.bulk.selectTrainings")}
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
          <strong>{selectedCount}</strong>&nbsp;
          {t("common.training.bulk.selected")}
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
              {t("common.training.bulk.clearAll")}
            </button>
          ) : (
            <button
              type="button"
              className={`btn btn--select-toggle ${allSelected ? "is-active" : ""}`}
              onClick={() => guard(onToggleAll)}
              disabled={allDisabled}
            >
              {allSelected
                ? t("common.training.bulk.clearAll")
                : t("common.training.bulk.selectAll")}
            </button>
          )}

          <button
            type="button"
            className="btn btn--danger"
            onClick={() => guard(onBulkDelete)}
            disabled={deleteDisabled}
          >
            {t("common.training.bulk.delete", { count: selectedCount })}
          </button>

          <button
            ref={cancelRef}
            type="button"
            className="btn"
            onClick={() => guard(onToggleSelectMode)}
          >
            {t("common.training.bulk.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

// //src\app\components\training-card\ui\BulkActionsBar.tsx
// "use client";

// import type { RefObject } from "react";

// type Props = {
//   toggleRef: RefObject<HTMLButtonElement | null>;
//   cancelRef: RefObject<HTMLButtonElement | null>;
//   clearRef: RefObject<HTMLButtonElement | null>;
//   selectMode: boolean;
//   onToggleSelectMode: () => void;
//   selectedCount: number;
//   allSelected: boolean;
//   busy: boolean;
//   isEmpty: boolean;
//   onToggleAll: () => void;
//   onClear: () => void;
//   onBulkDelete: () => void;
// };

// export default function BulkActionsBar({
//   toggleRef,
//   cancelRef,
//   clearRef,
//   selectMode,
//   onToggleSelectMode,
//   selectedCount,
//   allSelected,
//   busy,
//   isEmpty,
//   onToggleAll,
//   onClear,
//   onBulkDelete,
// }: Props) {
//   const showClear = selectMode && selectedCount >= 2;

//   function guard(cb: () => void) {
//     if (busy) return;
//     cb();
//   }

//   if (!selectMode) {
//     return (
//       <div className="bookings-admin news-admin__box--scroll3   ">
//         <div className="actions news-admin__actions">
//           <button
//             ref={toggleRef}
//             type="button"
//             className="btn btn--select-toggle"
//             onClick={() => guard(onToggleSelectMode)}
//             disabled={isEmpty}
//           >
//             Auswählen
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const deleteDisabled = busy || selectedCount === 0;
//   const allDisabled = busy || isEmpty;

//   return (
//     <div className="news-admin__top-actions">
//       <div className="bulkbar">
//         <div className="bulkbar__left">
//           <strong>{selectedCount}</strong>&nbsp;ausgewählt
//         </div>

//         <div className="bulkbar__right">
//           {showClear ? (
//             <button
//               ref={clearRef}
//               type="button"
//               className="btn btn--select-toggle is-active"
//               onClick={() => guard(onClear)}
//               disabled={allDisabled}
//             >
//               Alles aufheben
//             </button>
//           ) : (
//             <button
//               type="button"
//               className={`btn btn--select-toggle ${allSelected ? "is-active" : ""}`}
//               onClick={() => guard(onToggleAll)}
//               disabled={allDisabled}
//             >
//               {allSelected ? "Alles aufheben" : "Alle auswählen"}
//             </button>
//           )}

//           <button
//             type="button"
//             className="btn btn--danger"
//             onClick={() => guard(onBulkDelete)}
//             disabled={deleteDisabled}
//           >
//             Löschen ({selectedCount})
//           </button>

//           <button
//             ref={cancelRef}
//             type="button"
//             className="btn"
//             onClick={() => guard(onToggleSelectMode)}
//           >
//             Abbrechen
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
