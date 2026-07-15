"use client";

import { useTranslation } from "react-i18next";
import type { PartnerFieldProps } from "./partnerDialogFields.types";

export function PartnerNameField(props: PartnerFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.partners.name")}</label>
      <input
        className="input"
        value={props.draft.name}
        onChange={(event) => props.updatePartner("name", event.target.value)}
        required
      />
    </div>
  );
}

export function PartnerSortField(props: PartnerFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.partners.sortOrder")}</label>
      <input
        className="input"
        type="number"
        value={props.draft.sortOrder}
        onChange={(event) =>
          props.updatePartner("sortOrder", Number(event.target.value || 100))
        }
      />
    </div>
  );
}

export function PartnerUrlField(props: PartnerFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.partners.url")}</label>
      <input
        className="input"
        type="url"
        value={props.draft.url}
        onChange={(event) => props.updatePartner("url", event.target.value)}
      />
    </div>
  );
}

export function PartnerLogoUrlField(props: PartnerFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="field field--full">
      <label className="dialog-label">{t("admin.partners.logoUrl")}</label>
      <input
        className="input"
        value={props.draft.logoUrl}
        onChange={(event) => props.updatePartner("logoUrl", event.target.value)}
        required
      />
    </div>
  );
}
