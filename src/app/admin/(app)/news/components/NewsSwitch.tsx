"use client";

import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  checked: boolean;
  busy: boolean;
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

export default function NewsSwitch({ checked, busy, onToggle }: Props) {
  const { t } = useTranslation();
  return (
    <span
      className={`coach-switch ${checked ? "is-on" : ""} ${
        busy ? "is-busy" : ""
      }`}
      role="switch"
      aria-checked={!!checked}
      aria-label={
        checked
          ? t("common.admin.news.switch.online")
          : t("common.admin.news.switch.offline")
      }
      tabIndex={0}
      onPointerDown={stop}
      onMouseDown={stop}
      onClick={(e) => {
        stop(e);
        if (busy) return;
        onToggle();
      }}
      onKeyDown={(e) => onActionKey(e, onToggle, busy)}
      title={
        checked
          ? t("common.admin.news.switch.online")
          : t("common.admin.news.switch.offline")
      }
    >
      <span className="coach-switch__track">
        <span className="coach-switch__thumb" />
      </span>
    </span>
  );
}
