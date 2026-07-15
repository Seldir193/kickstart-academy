"use client";

import { useTranslation } from "react-i18next";

import ConfirmDialog from "../../coaches/moderation/ConfirmDialog";

type Props = {
  open: boolean;
  feedbackName: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function DeleteFeedbackDialog(props: Props) {
  const { t } = useTranslation();
  const { open, feedbackName, onClose, onConfirm } = props;

  return (
    <ConfirmDialog
      open={open}
      title={t("admin.feedbacks.deleteDialogTitle")}
      text={t("admin.feedbacks.deleteDialogText", { feedbackName })}
      confirmText={t("common.actions.confirm")}
      cancelText={t("common.actions.cancel")}
      danger={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
