"use client";

import { useTranslation } from "react-i18next";
import LicenseeInfoDialogView from "./licenseeInfoDialog/LicenseeInfoDialogView";
import type { LicenseeInfoDialogProps } from "./licenseeInfoDialog/licenseeInfoDialog.types";
import { useLicenseeInfoSections } from "./licenseeInfoDialog/useLicenseeInfoSections";

export default function LicenseeInfoDialog({
  open,
  item,
  onClose,
}: LicenseeInfoDialogProps) {
  const { t, i18n } = useTranslation();
  const sections = useLicenseeInfoSections(item, i18n.language, t);
  if (!open || !item || !sections) return null;
  return <LicenseeInfoDialogView sections={sections} onClose={onClose} t={t} />;
}
