import type { AdminMember, MemberRole } from "../../api";

export function cleanMemberValue(value: unknown) {
  return String(value ?? "").trim();
}

export function nextMemberRole(member: AdminMember): MemberRole {
  return cleanMemberValue(member.role).toLowerCase() === "super"
    ? "provider"
    : "super";
}

export function memberIsActive(member: AdminMember) {
  return (member as AdminMember & { isActive?: boolean }).isActive !== false;
}
