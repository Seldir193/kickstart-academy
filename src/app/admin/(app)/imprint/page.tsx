// src/app/admin/imprint/page.tsx
"use client";

import { useTranslation } from "react-i18next";

export const runtime = "nodejs";

export default function AdminImprintPage() {
  const { t } = useTranslation();

  const portalUrl =
    process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";

  const privacyUrl = "/admin/privacy";
  const publicPrivacyUrl = process.env.NEXT_PUBLIC_WP_BASE_URL
    ? `${process.env.NEXT_PUBLIC_WP_BASE_URL.replace(/\/$/, "")}/datenschutz/`
    : "";

  return (
    <section className="ks-impressum">
      <div className="container">
        <div className="ks-impressum__content">
          <header className="ks-impressum__head">
            <h1 className="ks-impressum__title">{t("common.imprint.title")}</h1>
          </header>

          <p className="text-gray-700">
            <strong>{t("common.imprint.scopeTitle")}</strong>{" "}
            {t("common.imprint.scopeTextBeforePortal")}{" "}
            <strong>DFSMANAGER</strong>{" "}
            {t("common.imprint.scopeTextAfterPortal")}{" "}
            <strong>{portalUrl}</strong>.
            <br />
            {t("common.imprint.scopePublicWebsite")}
          </p>

          <h2>{t("common.imprint.section.ddg")}</h2>
          <p>
            Selcuk Kocyigit
            <br />
            Dortmunder Fussballschule
            <br />
            Hochfelder Straße 33
            <br />
            47226 Duisburg
            <br />
            Deutschland
          </p>

          <h2>{t("common.imprint.section.contact")}</h2>
          <p>
            {t("common.imprint.phone")}:{" "}
            <a href="tel:+4917643203362">+49 176 4320 3362</a>
            <br />
            {t("common.imprint.email")}:{" "}
            <a href="mailto:fussballschule@selcuk-kocyigit.de">
              fussballschule@selcuk-kocyigit.de
            </a>
          </p>

          <h2>{t("common.imprint.section.liabilityContent")}</h2>
          <p>{t("common.imprint.liabilityContentText")}</p>

          <h2>{t("common.imprint.section.externalLinks")}</h2>
          <p>{t("common.imprint.externalLinksText")}</p>

          <h2>{t("common.imprint.section.copyright")}</h2>
          <p>{t("common.imprint.copyrightText")}</p>

          <h2>{t("common.imprint.section.privacy")}</h2>
          <p>
            {t("common.imprint.privacyTextBeforeLink")}{" "}
            <a href={privacyUrl}>{t("common.imprint.privacyPolicy")}</a>
            {publicPrivacyUrl ? (
              <>
                {" "}
                ({t("common.imprint.publicWebsite")}:{" "}
                <a href={publicPrivacyUrl} target="_blank" rel="noreferrer">
                  {t("common.imprint.privacyPolicy")}
                </a>
                ).
              </>
            ) : (
              "."
            )}
          </p>

          <h2>{t("common.imprint.section.consumerDispute")}</h2>
          <p>{t("common.imprint.consumerDisputeText")}</p>
        </div>
      </div>
    </section>
  );
}
