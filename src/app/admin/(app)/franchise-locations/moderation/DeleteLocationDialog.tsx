"use client";

import ConfirmDialog from "../../coaches/moderation/ConfirmDialog";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={open}
      title={t("common.admin.franchiseLocations.deleteDialog.title")}
      text={t("common.admin.franchiseLocations.deleteDialog.text", {
        name: locationName,
      })}
      confirmText="Confirm"
      cancelText="Cancel"
      danger={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
