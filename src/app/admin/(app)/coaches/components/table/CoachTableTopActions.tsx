import type { RefObject } from "react";
import BulkActions from "../BulkActions";
import type { CoachTableHandlers } from "./types";

type Props = {
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
  cancelBtnRef: RefObject<HTMLButtonElement | null>;
  clearBtnRef: RefObject<HTMLButtonElement | null>;
  selectMode: boolean;
  count: number;
  isAllSelected: boolean;
  disabled: boolean;
  showClear: boolean;
  handlers: CoachTableHandlers;
};

export default function CoachTableTopActions(props: Props) {
  return (
    <div className="coach-admin__top-actions">
      <BulkActions {...bulkProps(props)} />
    </div>
  );
}

function bulkProps(props: Props) {
  return {
    toggleRef: props.toggleBtnRef as RefObject<HTMLButtonElement | null>,
    cancelRef: props.cancelBtnRef,
    clearRef: props.clearBtnRef,
    selectMode: props.selectMode,
    onToggleSelectMode: props.handlers.toggleMode,
    count: props.count,
    isAllSelected: props.isAllSelected,
    disabled: props.disabled,
    onToggleAll: props.handlers.toggleAll,
    onClear: props.handlers.clearSelection,
    showClear: props.showClear,
    onDelete: props.handlers.deleteSelected,
  };
}
