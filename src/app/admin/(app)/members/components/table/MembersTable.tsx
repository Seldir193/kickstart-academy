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
          {props.items.map((member) => (
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
          ))}
        </ul>
      </div>
    </div>
  );
}

function MembersTableHead({ t }: { t: Props["t"] }) {
  return (
    <div className="members-list__head" aria-hidden="true">
      <div className="members-list__h">{t("common.admin.members.table.name")}</div>
      <div className="members-list__h">{t("common.admin.members.table.email")}</div>
      <div className="members-list__h">{t("common.admin.members.table.status")}</div>
      <div className="members-list__h">{t("common.admin.members.table.role")}</div>
      <div className="members-list__h members-list__h--right">
        {t("common.admin.members.table.action")}
      </div>
    </div>
  );
}
