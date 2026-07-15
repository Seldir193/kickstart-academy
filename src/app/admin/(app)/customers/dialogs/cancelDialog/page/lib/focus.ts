import type React from "react";

export function rememberButtonFocusState(
  e: React.MouseEvent<HTMLButtonElement>,
) {
  e.currentTarget.dataset.wasFocused = String(
    document.activeElement === e.currentTarget,
  );
}

export function toggleButtonFocus(
  e: React.MouseEvent<HTMLButtonElement>,
  action: () => void,
) {
  const btn = e.currentTarget;
  const wasFocused = btn.dataset.wasFocused === "true";
  action();
  requestAnimationFrame(() => restoreButtonFocus(btn, wasFocused));
}

function restoreButtonFocus(btn: HTMLButtonElement, wasFocused: boolean) {
  if (wasFocused) btn.blur();
  else btn.focus({ preventScroll: true });
  delete btn.dataset.wasFocused;
}
