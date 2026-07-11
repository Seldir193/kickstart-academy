"use client";

import { useTranslation } from "react-i18next";
import type { AdminMember } from "../../api";
import MemberDialogs from "./MemberDialogs";
import MembersTable from "./MembersTable";
import type { MembersTableProps } from "./membersTable.types";
import { useMembersTableDialogs } from "./useMembersTableDialogs";

export default function MembersTableListContent(props: MembersTableProps) {
  const { t } = useTranslation();
  const dialogs = useMembersTableDialogs();

  if (!props.items.length) return <EmptyMembers t={t} />;

  const roleItem = dialogs.roleItem;
  const activeItem = dialogs.activeItem;
  const canEditRole = roleItem ? canEdit(roleItem, props.busy, props.canEditRoles) : false;
  const canEditActive = activeItem ? canEdit(activeItem, props.busy, props.canEditActive) : false;

  return (
    <>
      <section className={`card members-list ${props.busy ? "is-busy" : ""}`}>
        <MembersTable
          {...props}
          t={t}
          onInfo={dialogs.openInfo}
          onRole={dialogs.openRole}
          onActive={dialogs.openActive}
        />
      </section>
      <MemberDialogs
        infoItem={dialogs.infoItem}
        roleItem={roleItem}
        roleNext={dialogs.roleNext}
        activeItem={activeItem}
        activeNext={dialogs.activeNext}
        canEditRole={canEditRole}
        canEditActive={canEditActive}
        roleLockedReason={lockedReason(t, roleItem, props.busy, props.canEditRoles, "role")}
        activeLockedReason={lockedReason(t, activeItem, props.busy, props.canEditActive, "active")}
        onCloseInfo={dialogs.closeInfo}
        onCloseRole={dialogs.closeRole}
        onCloseActive={dialogs.closeActive}
        onConfirmRole={() => confirmRole(props, roleItem, dialogs.roleNext)}
        onConfirmActive={() => confirmActive(props, activeItem, dialogs.activeNext)}
      />
    </>
  );
}

function EmptyMembers({ t }: { t: (key: string) => string }) {
  return (
    <section className="card">
      <div className="card__empty">{t("common.admin.members.empty")}</div>
    </section>
  );
}

function canEdit(member: AdminMember, busy: boolean, allowed: boolean) {
  return !busy && allowed && !member.isOwner;
}

function lockedReason(
  t: (key: string) => string,
  member: AdminMember | null,
  busy: boolean,
  allowed: boolean,
  kind: "role" | "active",
) {
  if (!member) return "";
  if (!allowed) return t(`common.admin.members.locked.${kind}OwnerOnly`);
  if (member.isOwner) return t(`common.admin.members.locked.owner${capitalize(kind)}`);
  if (busy) return t("common.admin.members.locked.pleaseWait");
  return "";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

async function confirmRole(
  props: MembersTableProps,
  member: AdminMember | null,
  nextRole: MembersTableProps["items"][number]["role"] | null,
) {
  if (!member || !nextRole) return;
  await props.onSetRole(member, nextRole);
}

async function confirmActive(
  props: MembersTableProps,
  member: AdminMember | null,
  nextActive: boolean | null,
) {
  if (!member || typeof nextActive !== "boolean") return;
  await props.onSetActive(member, nextActive);
}
