"use client";

import ConfirmDialog from "./ConfirmDialog";

type Props = {
  open: boolean;
  coachName: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function DeleteCoachDialog({
  open,
  coachName,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete coach"
      text={`Do you really want to delete coach "${coachName}"?`}
      confirmText="Confirm"
      cancelText="Cancel"
      danger={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
