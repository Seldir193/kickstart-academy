import type { KeyboardEvent, SyntheticEvent } from "react";

export function blurTarget(target: EventTarget | null) {
  const element = target as { blur?: () => void } | null;
  if (typeof element?.blur === "function") element.blur();
}

export function stop(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function onActionKey(
  event: KeyboardEvent,
  run: () => void,
  disabled: boolean,
) {
  if (disabled || !isActionKey(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  blurTarget(event.currentTarget);
  run();
}

function isActionKey(key: string) {
  return key === "Enter" || key === " ";
}
