import type { TFunction } from "i18next";
import type { RefObject } from "react";

type Props = {
  toggleRef: RefObject<HTMLButtonElement | null>;
  disabled: boolean;
  onToggleSelectMode: () => void;
  t: TFunction;
};

export default function BulkActionsInactive(props: Props) {
  return <div className="actions coach-admin__actions"><StartButton {...props} /></div>;
}

function StartButton({ toggleRef, disabled, onToggleSelectMode, t }: Props) {
  return <button ref={toggleRef} type="button" className="btn btn--select-toggle" onMouseDown={(event) => event.preventDefault()} onClick={onToggleSelectMode} disabled={disabled}>{t("common.admin.coaches.bulk.select")}</button>;
}
