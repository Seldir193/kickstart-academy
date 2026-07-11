import type { TFunction } from "i18next";
import type { MemberRole } from "../../api";
import type { MembersSort } from "../../membersAdmin/useMembersAdminState";
import type { FilterOption, MemberStatus } from "./membersFilters.types";

export function roleOptions(t: TFunction): FilterOption<MemberRole | "">[] {
  return [
    { value: "", label: t("common.admin.members.filters.all") },
    { value: "provider", label: t("common.admin.members.roles.provider") },
    { value: "super", label: t("common.admin.members.roles.superadmin") },
  ];
}

export function statusOptions(t: TFunction): FilterOption<MemberStatus>[] {
  return [
    { value: "", label: t("common.admin.members.filters.all") },
    { value: "active", label: t("common.admin.members.status.active") },
    { value: "inactive", label: t("common.admin.members.status.inactive") },
  ];
}

export function sortOptions(t: TFunction): FilterOption<MembersSort>[] {
  return [
    { value: "newest", label: t("common.admin.members.sort.newest") },
    { value: "oldest", label: t("common.admin.members.sort.oldest") },
    { value: "name_az", label: t("common.admin.members.sort.nameAz") },
    { value: "name_za", label: t("common.admin.members.sort.nameZa") },
    { value: "email_az", label: t("common.admin.members.sort.emailAz") },
    { value: "email_za", label: t("common.admin.members.sort.emailZa") },
  ];
}
