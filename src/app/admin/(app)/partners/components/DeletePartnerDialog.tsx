"use client";

import { useTranslation } from "react-i18next";
import ConfirmDialog from "../../coaches/moderation/ConfirmDialog";

type Props = {
  open: boolean;
  partnerName: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function DeletePartnerDialog(props: Props) {
  const { t } = useTranslation();
  const { open, partnerName, onClose, onConfirm } = props;

  return (
    <ConfirmDialog
      open={open}
      title={t("admin.partners.deleteDialogTitle")}
      text={t("admin.partners.deleteDialogText", { partnerName })}
      confirmText={t("common.actions.confirm")}
      cancelText={t("common.actions.cancel")}
      danger={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
