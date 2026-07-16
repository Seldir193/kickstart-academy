"use client";

import { useTranslation } from "react-i18next";
import type { AdminMember } from "../../api";
import MemberDialogs from "./MemberDialogs";
import MembersTable from "./MembersTable";
import type { MembersTableProps } from "./membersTable.types";
import { useMembersTableDialogs } from "./useMembersTableDialogs";

type Dialogs = ReturnType<typeof useMembersTableDialogs>;
type Translate = ReturnType<typeof useTranslation>["t"];
type SectionProps = MembersTableProps & { t: Translate; dialogs: Dialogs };

export default function MembersTableListContent(props: MembersTableProps) {
  const { t } = useTranslation();
  const dialogs = useMembersTableDialogs();

  if (!props.items.length) return <EmptyMembers t={t} />;

  return (
    <>
      <MembersSection {...props} t={t} dialogs={dialogs} />
      <MemberDialogs {...dialogProps(props, dialogs, t)} />
    </>
  );
}

function MembersSection({ t, dialogs, ...props }: SectionProps) {
  return (
    <section className={`card members-list ${props.busy ? "is-busy" : ""}`}>
      <MembersTable
        {...props}
        t={t}
        onInfo={dialogs.openInfo}
        onRole={dialogs.openRole}
        onActive={dialogs.openActive}
      />
    </section>
  );
}

function EmptyMembers({ t }: { t: (key: string) => string }) {
  return (
    <section className="card">
      <div className="card__empty">{t("common.admin.members.empty")}</div>
    </section>
  );
}

function dialogProps(props: MembersTableProps, dialogs: Dialogs, t: Translate) {
  return {
    ...dialogItems(dialogs),
    ...dialogPermissions(props, dialogs, t),
    ...dialogHandlers(props, dialogs),
  };
}

function dialogItems(dialogs: Dialogs) {
  return {
    infoItem: dialogs.infoItem,
    roleItem: dialogs.roleItem,
    roleNext: dialogs.roleNext,
    activeItem: dialogs.activeItem,
    activeNext: dialogs.activeNext,
  };
}

function dialogPermissions(
  props: MembersTableProps,
  dialogs: Dialogs,
  t: Translate,
) {
  const { roleItem, activeItem } = dialogs;
  const { busy, canEditRoles, canEditActive } = props;
  return {
    canEditRole: canEdit(roleItem, busy, canEditRoles),
    canEditActive: canEdit(activeItem, busy, canEditActive),
    roleLockedReason: lockedReason(t, roleItem, busy, canEditRoles, "role"),
    activeLockedReason: lockedReason(
      t,
      activeItem,
      busy,
      canEditActive,
      "active",
    ),
  };
}

function dialogHandlers(props: MembersTableProps, dialogs: Dialogs) {
  return {
    onCloseInfo: dialogs.closeInfo,
    onCloseRole: dialogs.closeRole,
    onCloseActive: dialogs.closeActive,
    onConfirmRole: () => confirmRole(props, dialogs.roleItem, dialogs.roleNext),
    onConfirmActive: () =>
      confirmActive(props, dialogs.activeItem, dialogs.activeNext),
  };
}

function canEdit(member: AdminMember | null, busy: boolean, allowed: boolean) {
  return !!member && !busy && allowed && !member.isOwner;
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
  if (member.isOwner)
    return t(`common.admin.members.locked.owner${capitalize(kind)}`);
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
