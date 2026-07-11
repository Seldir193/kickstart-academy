"use client";

import { useTranslation } from "react-i18next";
import ImprintContent from "./components/ImprintContent";
import { getImprintLinks } from "./imprint.helpers";

export const runtime = "nodejs";

export default function AdminImprintPage() {
  const { t } = useTranslation();
  const links = getImprintLinks();

  return <ImprintContent links={links} t={t} />;
}
