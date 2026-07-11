import type { AdminMember, MemberRole } from "../../api";

export type MembersTableProps = {
  items: AdminMember[];
  busy: boolean;
  canEditRoles: boolean;
  canEditActive: boolean;
  onSetRole: (u: AdminMember, next: MemberRole) => void | Promise<void>;
  onSetActive: (u: AdminMember, active: boolean) => void | Promise<void>;
};

export type MemberDialogState = {
  infoOpen: boolean;
  infoItem: AdminMember | null;
  roleOpen: boolean;
  roleItem: AdminMember | null;
  roleNext: MemberRole | null;
  activeOpen: boolean;
  activeItem: AdminMember | null;
  activeNext: boolean | null;
};
