import { useState } from "react";
import type { AdminMember, MemberRole } from "../../api";
import { memberIsActive, nextMemberRole } from "./membersTable.helpers";

export function useMembersTableDialogs() {
  const [infoItem, setInfoItem] = useState<AdminMember | null>(null);
  const [roleItem, setRoleItem] = useState<AdminMember | null>(null);
  const [roleNext, setRoleNext] = useState<MemberRole | null>(null);
  const [activeItem, setActiveItem] = useState<AdminMember | null>(null);
  const [activeNext, setActiveNext] = useState<boolean | null>(null);

  function openInfo(member: AdminMember) {
    setInfoItem(member);
  }

  function openRole(member: AdminMember) {
    setRoleItem(member);
    setRoleNext(nextMemberRole(member));
  }

  function openActive(member: AdminMember) {
    setActiveItem(member);
    setActiveNext(!memberIsActive(member));
  }

  function closeInfo() {
    setInfoItem(null);
  }

  function closeRole() {
    setRoleItem(null);
    setRoleNext(null);
  }

  function closeActive() {
    setActiveItem(null);
    setActiveNext(null);
  }

  return {
    infoItem,
    roleItem,
    roleNext,
    activeItem,
    activeNext,
    openInfo,
    openRole,
    openActive,
    closeInfo,
    closeRole,
    closeActive,
  };
}
