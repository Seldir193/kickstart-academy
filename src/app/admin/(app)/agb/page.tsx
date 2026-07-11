"use client";

import { useTranslation } from "react-i18next";
import TermsContent from "./components/TermsContent";

export default function AdminTermsPage() {
  const { t } = useTranslation();

  return <TermsContent t={t} />;
}
