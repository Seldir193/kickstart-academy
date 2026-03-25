"use client";

import type { RefObject } from "react";

type Props = {
  toggleRef: RefObject<HTMLButtonElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  clearRef: RefObject<HTMLButtonElement | null>;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  count: number;
  isAllSelected?: boolean;
  busy: boolean;
  isEmpty: boolean;
  onToggleAll: () => void;
  onClear: () => void;
  showClear: boolean;
  onDelete: () => void;
  canDelete?: boolean;
  toggleLabel?: string;
  selectedLabel?: string;
  selectAllLabel?: string;
  clearAllLabel?: string;
  deleteLabel?: string;
  cancelLabel?: string;
};

export default function BulkActions({
  toggleRef,
  cancelRef,
  clearRef,
  selectMode,
  onToggleSelectMode,
  count,
  isAllSelected,
  busy,
  isEmpty,
  onToggleAll,
  onClear,
  showClear,
  onDelete,
  canDelete = true,
  toggleLabel = "Select",
  selectedLabel = "selected",
  selectAllLabel = "Select all",
  clearAllLabel = "Clear all",
  deleteLabel = "Delete",
  cancelLabel = "Cancel",
}: Props) {
  function guard(cb: () => void) {
    if (busy) return;
    cb();
  }

  if (!selectMode) {
    return (
      <div className="actions news-admin__actions">
        <button
          ref={toggleRef}
          type="button"
          className="btn btn--select-toggle"
          onClick={() => guard(onToggleSelectMode)}
          disabled={isEmpty}
        >
          {toggleLabel}
        </button>
      </div>
    );
  }

  const deleteDisabled = busy || count === 0 || !canDelete;
  const allDisabled = busy || isEmpty;

  return (
    <div className="bulkbar">
      <div className="bulkbar__left">
        <strong>{count}</strong>&nbsp;{selectedLabel}
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
            {clearAllLabel}
          </button>
        ) : (
          <button
            type="button"
            className={`btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`}
            onClick={() => guard(onToggleAll)}
            disabled={allDisabled}
          >
            {isAllSelected ? clearAllLabel : selectAllLabel}
          </button>
        )}

        {canDelete ? (
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => guard(onDelete)}
            disabled={deleteDisabled}
          >
            {deleteLabel} ({count})
          </button>
        ) : null}

        <button
          ref={cancelRef}
          type="button"
          className="btn"
          onClick={() => guard(onToggleSelectMode)}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}

// //src\app\admin\(app)\news\components\BulkActions.tsx
// "use client";

// import type { RefObject } from "react";

// type Props = {
//   toggleRef: RefObject<HTMLButtonElement | null>;
//   cancelRef: RefObject<HTMLButtonElement | null>;
//   clearRef: RefObject<HTMLButtonElement | null>;
//   selectMode: boolean;
//   onToggleSelectMode: () => void;
//   count: number;
//   isAllSelected?: boolean;
//   busy: boolean;
//   isEmpty: boolean;
//   onToggleAll: () => void;
//   onClear: () => void;
//   showClear: boolean;
//   onDelete: () => void;
//   canDelete?: boolean;
// };

// export default function BulkActions({
//   toggleRef,
//   cancelRef,
//   clearRef,
//   selectMode,
//   onToggleSelectMode,
//   count,
//   isAllSelected,
//   busy,
//   isEmpty,
//   onToggleAll,
//   onClear,
//   showClear,
//   onDelete,
//   canDelete = true,
// }: Props) {
//   function guard(cb: () => void) {
//     if (busy) return;
//     cb();
//   }

//   if (!selectMode) {
//     return (
//       <div className="actions news-admin__actions">
//         <button
//           ref={toggleRef}
//           type="button"
//           className="btn btn--select-toggle"
//           onClick={() => guard(onToggleSelectMode)}
//           disabled={isEmpty}
//         >
//           Auswählen
//         </button>
//       </div>
//     );
//   }

//   const deleteDisabled = busy || count === 0 || !canDelete;
//   const allDisabled = busy || isEmpty;

//   return (
//     <div className="bulkbar">
//       <div className="bulkbar__left">
//         <strong>{count}</strong>&nbsp;ausgewählt
//       </div>

//       <div className="bulkbar__right">
//         {showClear ? (
//           <button
//             ref={clearRef}
//             type="button"
//             className="btn btn--select-toggle is-active"
//             onClick={() => guard(onClear)}
//             disabled={allDisabled}
//           >
//             Alles aufheben
//           </button>
//         ) : (
//           <button
//             type="button"
//             className={`btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`}
//             onClick={() => guard(onToggleAll)}
//             disabled={allDisabled}
//           >
//             {isAllSelected ? "Alles aufheben" : "Alle auswählen"}
//           </button>
//         )}

//         {canDelete ? (
//           <button
//             type="button"
//             className="btn btn--danger"
//             onClick={() => guard(onDelete)}
//             disabled={deleteDisabled}
//           >
//             Löschen ({count})
//           </button>
//         ) : null}

//         <button
//           ref={cancelRef}
//           type="button"
//           className="btn"
//           onClick={() => guard(onToggleSelectMode)}
//         >
//           Abbrechen
//         </button>
//       </div>
//     </div>
//   );
// }
