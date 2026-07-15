import type React from "react";
import { onActionKey, stopEvent } from "./coachTableEvents";

type Props = {
  title: string;
  icon: string;
  disabled: boolean;
  onRun: () => void | Promise<void>;
  iconClassName?: string;
  tip?: string;
};

export default function CoachRowActionButton(props: Props) {
  return (
    <span
      className={actionClass(props.disabled)}
      role="button"
      tabIndex={0}
      title={props.title}
      data-ks-tip={props.tip}
      aria-disabled={props.disabled ? true : undefined}
      onClick={(e) => clickAction(e, props)}
      onKeyDown={(e) => onActionKey(e, () => props.onRun(), props.disabled)}
    >
      <img
        src={props.icon}
        alt=""
        aria-hidden="true"
        className={props.iconClassName || "icon-img"}
      />
    </span>
  );
}

function actionClass(disabled: boolean) {
  return `edit-trigger${disabled ? " is-disabled" : ""}`;
}

function clickAction(e: React.SyntheticEvent, props: Props) {
  stopEvent(e);
  if (!props.disabled) void Promise.resolve(props.onRun());
}
