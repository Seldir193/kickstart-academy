import type React from "react";
import type { Coach } from "../../types";

export function stopEvent(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function onActionKey(e: React.KeyboardEvent, cb: () => void, disabled: boolean) {
  if (disabled || !isActionKey(e.key)) return;
  stopEvent(e);
  cb();
}

function isActionKey(key: string) {
  return key === "Enter" || key === " ";
}

export function rowPointerDown(selectMode: boolean) {
  return (e: React.PointerEvent) => {
    if (selectMode) e.preventDefault();
  };
}

export function rowKeyDown(raw: Coach, rowClick: (c: Coach) => void) {
  return (e: React.KeyboardEvent) => {
    if (!isActionKey(e.key)) return;
    e.preventDefault();
    rowClick(raw);
  };
}
