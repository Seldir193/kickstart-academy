"use client";

import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  checked: boolean;
  busy: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

function stop(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function onActionKey(
  e: React.KeyboardEvent,
  cb: () => void,
  disabled: boolean,
) {
  if (disabled) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  e.stopPropagation();
  cb();
}

export default function LocationSwitch({
  checked,
  busy,
  disabled,
  onToggle,
}: Props) {
  const { t } = useTranslation();
  const lock = busy || disabled === true;

  return (
    <span
      className={`coach-switch ${checked ? "is-on" : ""} ${busy ? "is-busy" : ""} ${
        disabled ? "is-disabled" : ""
      }`}
      role="switch"
      aria-label={
        checked
          ? t("common.admin.franchiseLocations.status.online")
          : t("common.admin.franchiseLocations.status.offline")
      }
      aria-checked={!!checked}
      aria-disabled={disabled ? true : undefined}
      tabIndex={lock ? -1 : 0}
      onPointerDown={stop}
      onMouseDown={stop}
      onClick={(e) => {
        stop(e);
        if (lock) return;
        onToggle();
      }}
      onKeyDown={(e) => onActionKey(e, onToggle, lock)}
    >
      <span className="coach-switch__track">
        <span className="coach-switch__thumb" />
      </span>
    </span>
  );
}
