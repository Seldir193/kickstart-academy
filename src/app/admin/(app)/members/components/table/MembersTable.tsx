import type { AdminMember } from "../../api";
import MemberTableRow from "./MemberTableRow";

type Props = {
  items: AdminMember[];
  busy: boolean;
  canEditRoles: boolean;
  canEditActive: boolean;
  t: (key: string) => string;
  onInfo: (member: AdminMember) => void;
  onRole: (member: AdminMember) => void;
  onActive: (member: AdminMember) => void;
};

export default function MembersTable(props: Props) {
  return (
    <div className="ks-customers-table-scroll">
      <div className="members-list__table">
        <MembersTableHead t={props.t} />
        <ul className="list list--bleed">
          {props.items.map((member) => renderMemberRow(member, props))}
        </ul>
      </div>
    </div>
  );
}

function renderMemberRow(member: AdminMember, props: Props) {
  return (
    <MemberTableRow
      key={String(member.id ?? "").trim()}
      member={member}
      busy={props.busy}
      canEditRoles={props.canEditRoles}
      canEditActive={props.canEditActive}
      t={props.t}
      onInfo={props.onInfo}
      onRole={props.onRole}
      onActive={props.onActive}
    />
  );
}

function MembersTableHead({ t }: { t: Props["t"] }) {
  return (
    <div className="members-list__head" aria-hidden="true">
      {renderHeadCell(t, "common.admin.members.table.name")}
      {renderHeadCell(t, "common.admin.members.table.email")}
      {renderHeadCell(t, "common.admin.members.table.status")}
      {renderHeadCell(t, "common.admin.members.table.role")}
      <div className="members-list__h members-list__h--right">
        {t("common.admin.members.table.action")}
      </div>
    </div>
  );
}

function renderHeadCell(t: Props["t"], labelKey: string) {
  return <div className="members-list__h">{t(labelKey)}</div>;
}
