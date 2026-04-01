"use client";

import ConfirmDialog from "../../coaches/moderation/ConfirmDialog";

type Props = {
  open: boolean;
  newsTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function DeleteNewsDialog({
  open,
  newsTitle,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete post"
      text={`Do you really want to delete post "${newsTitle}"?`}
      confirmText="Confirm"
      cancelText="Cancel"
      danger={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
