import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCloseOnOutsideClick } from "../hooks/useCloseOnOutsideClick";
import { activeOptionClass, openSelectClass, statusLabel } from "../lib/labels";
import type { BaseFieldProps } from "../types";
import SelectTrigger from "./SelectTrigger";

export default function FeedbackStatusField(props: BaseFieldProps) {
  const { t } = useTranslation();
  const state = useStatusState(props);
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.status")}</label>
      <StatusSelect {...props} {...state} t={t} />
    </div>
  );
}

function useStatusState({ updateFeedback }: BaseFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useCloseOnOutsideClick(dropdownRef, () => setIsOpen(false));
  const pickStatus = (nextActive: boolean) => {
    updateFeedback("isActive", nextActive);
    setIsOpen(false);
  };
  return { isOpen, setIsOpen, dropdownRef, pickStatus };
}

function StatusSelect(
  props: BaseFieldProps &
    ReturnType<typeof useStatusState> & { t: (key: string) => string },
) {
  return (
    <div ref={props.dropdownRef} className={openSelectClass(props.isOpen)}>
      <SelectTrigger onClick={() => props.setIsOpen((open) => !open)}>
        {statusLabel(props.draft.isActive, props.t)}
      </SelectTrigger>
      {props.isOpen ? <StatusPanel {...props} /> : null}
    </div>
  );
}

function StatusPanel(
  props: BaseFieldProps &
    ReturnType<typeof useStatusState> & { t: (key: string) => string },
) {
  return (
    <div className="ks-selectbox__panel">
      <StatusOption active {...props} />
      <StatusOption active={false} {...props} />
    </div>
  );
}

function StatusOption(
  props: BaseFieldProps &
    ReturnType<typeof useStatusState> & {
      t: (key: string) => string;
      active: boolean;
    },
) {
  const isActive = props.draft.isActive === props.active;
  return (
    <button
      type="button"
      className={activeOptionClass(isActive)}
      onClick={() => props.pickStatus(props.active)}
    >
      {statusLabel(props.active, props.t)}
    </button>
  );
}
