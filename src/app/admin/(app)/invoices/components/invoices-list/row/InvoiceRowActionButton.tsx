import type React from "react";
import type { InvoiceRowAction } from "./types";

function actionClassName(action: InvoiceRowAction) {
  const classes = ["ks-doc-open"];
  if (action.blocked) classes.push("ks-doc-open--blocked");
  if (action.hidden) classes.push("ks-doc-open--hidden");
  return classes.join(" ");
}

function clickHandler(action: InvoiceRowAction) {
  return (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (action.guard && !action.guard()) return;
    action.onClick?.();
  };
}

function actionButtonProps(action: InvoiceRowAction) {
  return {
    className: actionClassName(action),
    "aria-label": action.label,
    title: action.title,
    onClick: clickHandler(action),
    disabled: action.disabled,
    "aria-disabled": action.ariaDisabled,
    tabIndex: action.tabIndex,
  };
}

function ActionIcon({ src }: { src: string }) {
  return <img src={src} alt="" width={18} height={18} />;
}

export function InvoiceRowActionButton({ action }: { action: InvoiceRowAction }) {
  return (
    <button type="button" {...actionButtonProps(action)}>
      <ActionIcon src={action.icon} />
    </button>
  );
}
