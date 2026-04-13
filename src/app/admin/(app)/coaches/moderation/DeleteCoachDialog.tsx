"use client";

import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={open}
      title={t("common.admin.coaches.deleteDialog.title")}
      text={t("common.admin.coaches.deleteDialog.text", { coachName })}
      confirmText={t("common.actions.confirm")}
      cancelText={t("common.actions.cancel")}
      danger={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
