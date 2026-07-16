import type { AdminMember, MemberRole } from "../../api";
import ConfirmActiveDialog from "../../moderation/ConfirmActiveDialog";
import ConfirmRoleDialog from "../../moderation/ConfirmRoleDialog";
import MembersInfoDialog from "../../moderation/MembersInfoDialog";

type Props = {
  infoItem: AdminMember | null;
  roleItem: AdminMember | null;
  roleNext: MemberRole | null;
  activeItem: AdminMember | null;
  activeNext: boolean | null;
  canEditRole: boolean;
  canEditActive: boolean;
  roleLockedReason: string;
  activeLockedReason: string;
  onCloseInfo: () => void;
  onCloseRole: () => void;
  onCloseActive: () => void;
  onConfirmRole: () => void | Promise<void>;
  onConfirmActive: () => void | Promise<void>;
};

export default function MemberDialogs(props: Props) {
  return (
    <>
      <InfoDialog {...props} />
      <RoleDialog {...props} />
      <ActiveDialog {...props} />
    </>
  );
}

function InfoDialog(props: Props) {
  return (
    <MembersInfoDialog
      open={Boolean(props.infoItem)}
      item={props.infoItem}
      onClose={props.onCloseInfo}
    />
  );
}

function RoleDialog(props: Props) {
  return (
    <ConfirmRoleDialog
      open={Boolean(props.roleItem)}
      item={props.roleItem}
      nextRole={props.roleNext}
      onClose={props.onCloseRole}
      canEdit={props.canEditRole}
      lockedReason={props.roleLockedReason}
      onConfirm={props.onConfirmRole}
    />
  );
}

function ActiveDialog(props: Props) {
  return (
    <ConfirmActiveDialog
      open={Boolean(props.activeItem)}
      item={props.activeItem}
      nextActive={props.activeNext}
      onClose={props.onCloseActive}
      canEdit={props.canEditActive}
      lockedReason={props.activeLockedReason}
      onConfirm={props.onConfirmActive}
    />
  );
}
