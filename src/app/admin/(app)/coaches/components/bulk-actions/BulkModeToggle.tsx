import type { TFunction } from "i18next";
import type { RefObject } from "react";

type Props = {
  toggleRef: RefObject<HTMLButtonElement | null>;
  clearRef: RefObject<HTMLButtonElement | null>;
  isAllSelected?: boolean;
  disabled: boolean;
  onToggleAll: () => void;
  onClear: () => void;
  showClear: boolean;
  t: TFunction;
};

export default function BulkModeToggle(props: Props) {
  return props.showClear ? <ClearButton {...props} /> : <ToggleAllButton {...props} />;
}

function ClearButton({ clearRef, disabled, onClear, t }: Props) {
  return <button ref={clearRef} type="button" className="btn btn--select-toggle is-active" onClick={onClear} disabled={disabled}>{t("common.admin.coaches.bulk.clearSelection")}</button>;
}

function toggleClass(isAllSelected?: boolean) {
  return `btn btn--select-toggle ${isAllSelected ? "is-active" : ""}`;
}

function toggleLabel({ isAllSelected, t }: Props) {
  return isAllSelected ? t("common.admin.coaches.bulk.clearSelection") : t("common.admin.coaches.bulk.selectAll");
}

function ToggleAllButton(props: Props) {
  return <button ref={props.toggleRef} type="button" className={toggleClass(props.isAllSelected)} onClick={props.onToggleAll} disabled={props.disabled}>{toggleLabel(props)}</button>;
}
