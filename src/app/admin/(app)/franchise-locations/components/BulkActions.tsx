// src/app/admin/(app)/franchise-locations/components/BulkActions.tsx
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
  disabled: boolean;
  onToggleAll: () => void;
  onClear: () => void;
  showClear: boolean;
  onDelete: () => void;
};

export default function BulkActions({
  toggleRef,
  cancelRef,
  clearRef,
  selectMode,
  onToggleSelectMode,
  count,
  isAllSelected,
  disabled,
  onToggleAll,
  onClear,
  showClear,
  onDelete,
}: Props) {
  if (!selectMode) {
    return (
      <div className="actions news-admin__actions">
        <button
          ref={toggleRef}
          type="button"
          className="btn btn--select-toggle"
          onClick={onToggleSelectMode}
          disabled={disabled}
        >
          Select
        </button>
      </div>
    );
  }

  return (
    <div className="bulkbar">
      <div className="bulkbar__left">
        <strong>{count}</strong>&nbsp;selected
      </div>

      <div className="bulkbar__right">
        {showClear ? (
          <button
            ref={clearRef}
            type="button"
            className="btn btn--select-toggle is-active"
            onClick={onClear}
            disabled={disabled}
          >
            Clear selection
          </button>
        ) : (
          <button
            ref={toggleRef}
            type="button"
            className={`btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`}
            onClick={onToggleAll}
            disabled={disabled}
          >
            {isAllSelected ? "Clear selection" : "Select all"}
          </button>
        )}

        <button
          type="button"
          className="btn btn--danger"
          onClick={onDelete}
          disabled={disabled || count === 0}
        >
          Delete ({count})
        </button>

        <button
          ref={cancelRef}
          type="button"
          className="btn btn--focus-black"
          onClick={onToggleSelectMode}
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// // src/app/admin/(app)/franchise-locations/components/BulkActions.tsx
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
//   disabled: boolean;
//   onToggleAll: () => void;
//   onClear: () => void;
//   showClear: boolean;
//   onDelete: () => void;
// };

// export default function BulkActions({
//   toggleRef,
//   cancelRef,
//   clearRef,
//   selectMode,
//   onToggleSelectMode,
//   count,
//   isAllSelected,
//   disabled,
//   onToggleAll,
//   onClear,
//   showClear,
//   onDelete,
// }: Props) {
//   if (!selectMode) {
//     return (
//       <div className="actions news-admin__actions">
//         <button
//           ref={toggleRef}
//           type="button"
//           className="btn btn--select-toggle"
//           onClick={onToggleSelectMode}
//           disabled={disabled}
//         >
//           Auswählen
//         </button>
//       </div>
//     );
//   }

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
//             onClick={onClear}
//             disabled={disabled}
//           >
//             Alles aufheben
//           </button>
//         ) : (
//           <button
//             ref={toggleRef}
//             type="button"
//             className={`btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`}
//             onClick={onToggleAll}
//             disabled={disabled}
//           >
//             {isAllSelected ? "Alles aufheben" : "Alle auswählen"}
//           </button>
//         )}

//         <button
//           type="button"
//           className="btn btn--danger"
//           onClick={onDelete}
//           disabled={disabled || count === 0}
//         >
//           Löschen ({count})
//         </button>

//         <button
//           ref={cancelRef}
//           type="button"
//           className="btn btn--focus-black"
//           onClick={onToggleSelectMode}
//           disabled={disabled}
//         >
//           Abbrechen
//         </button>
//       </div>
//     </div>
//   );
// }
