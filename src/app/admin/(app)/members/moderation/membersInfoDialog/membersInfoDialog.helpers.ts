import type { TFunction } from "i18next";
import type { AdminMember } from "../../api";
import type { MembersInfoData } from "./membersInfoDialog.types";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function valueOrDash(value: unknown) {
  const cleanedValue = clean(value);
  return cleanedValue || "—";
}

export function getRoleLabel(t: TFunction, item: AdminMember) {
  if (item.isOwner) return t("common.admin.members.roles.owner");
  return clean(item.role).toLowerCase() === "super"
    ? t("common.admin.members.roles.superadmin")
    : t("common.admin.members.roles.provider");
}

export function getBadgeClass(item: AdminMember) {
  if (item.isOwner) return "is-owner";
  return clean(item.role).toLowerCase() === "super" ? "is-super" : "is-provider";
}

function getTitle(t: TFunction, item: AdminMember) {
  const title = valueOrDash(item.fullName);
  return title !== "—" ? title : t("common.admin.members.info.memberFallback");
}

export function buildMembersInfoData(t: TFunction, item: AdminMember): MembersInfoData {
  const source = item as AdminMember & { avatarUrl?: unknown; id?: unknown; _id?: unknown };
  return {
    title: getTitle(t, item),
    email: valueOrDash(item.email),
    role: getRoleLabel(t, item),
    isOwner: item.isOwner === true,
    avatarUrl: valueOrDash(source.avatarUrl),
    id: valueOrDash(source.id || source._id),
  };
}
