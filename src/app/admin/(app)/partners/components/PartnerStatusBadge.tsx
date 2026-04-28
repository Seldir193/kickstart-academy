"use client";

import { useTranslation } from "react-i18next";

type Props = {
  active: boolean;
};

export default function PartnerStatusBadge({ active }: Props) {
  const { t } = useTranslation();
  const className = active ? "pill pill--ok" : "pill pill--muted";
  const label = active
    ? t("admin.partners.active")
    : t("admin.partners.inactive");

  return <span className={className}>{label}</span>;
}
