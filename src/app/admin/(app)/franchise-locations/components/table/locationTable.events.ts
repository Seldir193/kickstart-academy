import type React from "react";

export function blurTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  element?.blur?.();
}

export function stop(event: React.SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function onActionKey(
  event: React.KeyboardEvent,
  run: () => void,
  disabled: boolean,
) {
  if (disabled || !isActionKey(event.key)) return;
  stop(event);
  blurTarget(event.currentTarget);
  run();
}

function isActionKey(key: string) {
  return key === "Enter" || key === " ";
}
