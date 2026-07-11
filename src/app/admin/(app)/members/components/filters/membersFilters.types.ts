import type { MemberRole } from "../../api";
import type { MembersSort } from "../../membersAdmin/useMembersAdminState";

export type MemberStatus = "active" | "inactive" | "";
export type FilterOption<T extends string> = { value: T; label: string };

export type MembersFiltersProps = {
  q: string;
  onChangeQ: (value: string) => void;
  role: MemberRole | "";
  onChangeRole: (value: MemberRole | "") => void;
  status: MemberStatus;
  onChangeStatus: (value: MemberStatus) => void;
  sort: MembersSort;
  onChangeSort: (value: MembersSort) => void;
};
