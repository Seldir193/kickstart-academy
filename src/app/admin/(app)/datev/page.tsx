"use client";

import { useTranslation } from "react-i18next";
import DatevExportContent from "./components/DatevExportContent";
import { useDatevExportPage } from "./hooks/useDatevExportPage";

export default function DatevExportPage() {
  const { t } = useTranslation();
  const model = useDatevExportPage(t);

  return <DatevExportContent model={model} t={t} />;
}
