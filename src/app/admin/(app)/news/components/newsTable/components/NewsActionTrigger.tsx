import type { KeyboardEvent, MouseEvent } from "react";
import type { NewsAction } from "../types";
import { blurTarget, onActionKey, stop } from "../lib/events";

export function NewsActionTrigger({ action }: { action: NewsAction }) {
  return (
    <span {...triggerProps(action)}>
      <img
        src={action.icon}
        alt=""
        aria-hidden="true"
        className={iconClass(action)}
      />
    </span>
  );
}

function triggerProps(action: NewsAction) {
  return {
    className: `edit-trigger ${action.disabled ? "is-disabled" : ""}`,
    role: "button",
    tabIndex: action.disabled ? -1 : 0,
    ...titleProps(action),
    "aria-label": action.title,
    "aria-disabled": action.disabled ? true : undefined,
    ...tipProps(action),
    onClick: (event: MouseEvent) => onClick(event, action),
    onKeyDown: (event: KeyboardEvent) =>
      onActionKey(event, () => void action.run(), action.disabled),
  };
}

function onClick(event: MouseEvent, action: NewsAction) {
  stop(event);
  blurTarget(event.currentTarget);
  if (!action.disabled) action.run();
}

function titleProps(action: NewsAction) {
  return action.tip ? {} : { title: action.title };
}

function tipProps(action: NewsAction) {
  return action.tip ? { "data-ks-tip": action.tip } : {};
}

function iconClass(action: NewsAction) {
  return `icon-img${action.left ? " icon-img--left" : ""}`;
}
