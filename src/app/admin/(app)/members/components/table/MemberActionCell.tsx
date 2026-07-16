import type { HTMLAttributes } from "react";
import type { AdminMember } from "../../api";
import {
  actionsFor,
  blurTarget,
  onActionKey,
  stop,
} from "../MembersTableList.helpers";
import type { Action } from "../MembersTableList.helpers";

type Props = {
  member: AdminMember;
  busy: boolean;
  canEditRoles: boolean;
  canEditActive: boolean;
  t: (key: string) => string;
  onInfo: (member: AdminMember) => void;
  onRole: (member: AdminMember) => void;
  onActive: (member: AdminMember) => void;
};

export default function MemberActionCell(props: Props) {
  return (
    <div
      className="members-list__cell members-list__cell--action"
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
    >
      {actionsFor(actionArgs(props)).map((action) => (
        <MemberAction key={action.key} action={action} />
      ))}
    </div>
  );
}

function MemberAction({ action }: { action: Action }) {
  return (
    <span {...actionAttrs(action)}>
      <img src={action.icon} alt="" aria-hidden="true" className="icon-img" />
    </span>
  );
}

function actionArgs(props: Props) {
  return {
    t: props.t,
    u: props.member,
    busy: props.busy,
    canEditRoles: props.canEditRoles,
    canEditActive: props.canEditActive,
    onInfo: props.onInfo,
    onEditRole: props.onRole,
    onEditActive: props.onActive,
  };
}

function actionAttrs(action: Action): HTMLAttributes<HTMLSpanElement> {
  return {
    className: `edit-trigger ${action.disabled ? "is-disabled" : ""}`,
    role: "button",
    tabIndex: action.disabled ? -1 : 0,
    ...(!action.tip ? { title: action.title } : {}),
    "aria-label": action.title,
    "aria-disabled": action.disabled ? true : undefined,
    ...(action.tip ? { "data-ks-tip": action.tip } : {}),
    onClick: (event) => runAction(event, action),
    onKeyDown: (event) =>
      onActionKey(event, () => void action.run(), action.disabled),
  };
}

function runAction(event: React.MouseEvent<HTMLSpanElement>, action: Action) {
  stop(event);
  blurTarget(event.currentTarget);
  if (!action.disabled) action.run();
}
