"use client";

import { useTranslation } from "react-i18next";
import PrivacyContent from "./components/PrivacyContent";

export default function AdminPrivacyPage() {
  const { t } = useTranslation();

  return <PrivacyContent t={t} />;
}
