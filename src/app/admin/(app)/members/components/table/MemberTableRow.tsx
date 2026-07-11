import type { AdminMember } from "../../api";
import {
  roleClass,
  roleLabel,
  statusClass,
  statusLabel,
} from "../MembersTableList.helpers";
import { cleanMemberValue } from "./membersTable.helpers";
import MemberActionCell from "./MemberActionCell";

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

export default function MemberTableRow(props: Props) {
  const member = props.member;
  const openRole = () => props.onRole(member);

  return (
    <li
      className="list__item chip members-list__row is-fullhover is-interactive"
      tabIndex={0}
      role="button"
      onClick={openRole}
      onKeyDown={(event) => handleRowKey(event, openRole)}
    >
      <MemberIdentity member={member} />
      <MemberStatus member={member} t={props.t} />
      <MemberRole member={member} t={props.t} />
      <MemberActionCell
        member={member}
        busy={props.busy}
        canEditRoles={props.canEditRoles}
        canEditActive={props.canEditActive}
        t={props.t}
        onInfo={props.onInfo}
        onRole={props.onRole}
        onActive={props.onActive}
      />
    </li>
  );
}

function handleRowKey(event: React.KeyboardEvent, run: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  run();
}

function MemberIdentity({ member }: { member: AdminMember }) {
  return (
    <>
      <div className="members-list__cell members-list__cell--name">
        <div className="members-list__title">
          {cleanMemberValue(member.fullName) || "—"}
        </div>
      </div>
      <div className="members-list__cell members-list__cell--email">
        <span className="members-list__mono">
          {cleanMemberValue(member.email) || "—"}
        </span>
      </div>
    </>
  );
}

function MemberStatus({ member, t }: { member: AdminMember; t: Props["t"] }) {
  return (
    <div className="members-list__cell members-list__cell--status">
      <span className={`members-list__status ${statusClass(member)}`}>
        {statusLabel(t, member)}
      </span>
    </div>
  );
}

function MemberRole({ member, t }: { member: AdminMember; t: Props["t"] }) {
  return (
    <div className="members-list__cell members-list__cell--role">
      <span className={`members-list__status ${roleClass(member)}`}>
        {roleLabel(t, member)}
      </span>
    </div>
  );
}
