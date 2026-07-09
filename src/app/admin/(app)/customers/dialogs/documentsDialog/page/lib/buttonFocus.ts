import type { ScopeButtonEvent } from "../types";

export function rememberButtonFocusState(e: ScopeButtonEvent) {
  e.currentTarget.dataset.wasFocused = String(document.activeElement === e.currentTarget);
}

export function toggleButtonFocus(e: ScopeButtonEvent, action: () => void) {
  const btn = e.currentTarget;
  const wasFocused = btn.dataset.wasFocused === "true";
  action();
  restoreButtonFocus(btn, wasFocused);
}

function restoreButtonFocus(btn: HTMLButtonElement, wasFocused: boolean) {
  requestAnimationFrame(() => applyButtonFocus(btn, wasFocused));
}

function applyButtonFocus(btn: HTMLButtonElement, wasFocused: boolean) {
  if (wasFocused) btn.blur();
  else btn.focus({ preventScroll: true });
  delete btn.dataset.wasFocused;
}
