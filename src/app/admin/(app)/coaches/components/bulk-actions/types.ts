import type { RefObject } from "react";

export type BulkActionsProps = {
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
