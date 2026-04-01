"use client";

import ConfirmDialog from "../../coaches/moderation/ConfirmDialog";

type Props = {
  open: boolean;
  locationName: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function DeleteLocationDialog({
  open,
  locationName,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete location"
      text={`Do you really want to delete location "${locationName}"?`}
      confirmText="Confirm"
      cancelText="Cancel"
      danger={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
