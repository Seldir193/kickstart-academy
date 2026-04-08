"use client";

import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={open}
      title={t("common.admin.news.deleteDialog.title")}
      text={t("common.admin.news.deleteDialog.text", { title: newsTitle })}
      confirmText={t("common.confirm")}
      cancelText={t("common.cancel")}
      danger={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
