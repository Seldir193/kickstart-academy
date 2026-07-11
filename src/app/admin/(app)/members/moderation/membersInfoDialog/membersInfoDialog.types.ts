import type { AdminMember } from "../../api";

export type MembersInfoDialogProps = {
  open: boolean;
  item: AdminMember | null;
  onClose: () => void;
};

export type MembersInfoData = {
  title: string;
  email: string;
  role: string;
  isOwner: boolean;
  avatarUrl: string;
  id: string;
};
