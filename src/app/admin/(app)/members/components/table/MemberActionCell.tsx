import type { AdminMember } from "../../api";
import {
  actionsFor,
  blurTarget,
  onActionKey,
  stop,
} from "../MembersTableList.helpers";

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
  const actions = actionsFor({
    t: props.t,
    u: props.member,
    busy: props.busy,
    canEditRoles: props.canEditRoles,
    canEditActive: props.canEditActive,
    onInfo: props.onInfo,
    onEditRole: props.onRole,
    onEditActive: props.onActive,
  });

  return (
    <div
      className="members-list__cell members-list__cell--action"
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
    >
      {actions.map((action) => (
        <MemberAction key={action.key} action={action} />
      ))}
    </div>
  );
}

function MemberAction({ action }: { action: ReturnType<typeof actionsFor>[number] }) {
  function runAction(event: React.MouseEvent<HTMLSpanElement>) {
    stop(event);
    blurTarget(event.currentTarget);
    if (!action.disabled) action.run();
  }

  return (
    <span
      className={`edit-trigger ${action.disabled ? "is-disabled" : ""}`}
      role="button"
      tabIndex={action.disabled ? -1 : 0}
      {...(!action.tip ? { title: action.title } : {})}
      aria-label={action.title}
      aria-disabled={action.disabled ? true : undefined}
      {...(action.tip ? { "data-ks-tip": action.tip } : {})}
      onClick={runAction}
      onKeyDown={(event) => onActionKey(event, () => void action.run(), action.disabled)}
    >
      <img src={action.icon} alt="" aria-hidden="true" className="icon-img" />
    </span>
  );
}
