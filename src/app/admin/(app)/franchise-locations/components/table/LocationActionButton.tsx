import type { MouseEvent } from "react";
import { blurTarget, onActionKey, stop, type Action } from "../LocationsTableList.helpers";

type Props = {
  action: Action;
};

export default function LocationActionButton({ action }: Props) {
  return (
    <span {...buttonProps(action)} onClick={(e) => clickAction(e, action)} onKeyDown={(e) => onActionKey(e, () => void action.run(), action.disabled)}>
      <img src={action.icon} alt="" aria-hidden="true" className={iconClass(action)} />
    </span>
  );
}

function buttonProps(a: Action) {
  return {
    className: `edit-trigger ${a.disabled ? "is-disabled" : ""}`,
    role: "button",
    tabIndex: a.disabled ? -1 : 0,
    ...(!a.tip ? { title: a.title } : {}),
    "aria-label": a.title,
    "aria-disabled": a.disabled ? true : undefined,
    ...(a.tip ? { "data-ks-tip": a.tip } : {}),
  } as const;
}

function clickAction(e: MouseEvent<HTMLElement>, a: Action) {
  stop(e);
  blurTarget(e.currentTarget);
  if (!a.disabled) a.run();
}

function iconClass(a: Action) {
  return "icon-img" + (a.left ? " icon-img--left" : "");
}
